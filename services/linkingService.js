// services/linkingService.js
// ─────────────────────────────────────────────
// Parent-Child Linking System
// Firestore Schema:
//   users/{childUid}  → { linkCode, parentUid, ... }
//   parents/{parentUid}/children/{childUid} → { name, linkCode, linkedAt }
// ─────────────────────────────────────────────

import { db } from "./firebaseConfig";
import {
  doc, setDoc, getDoc, updateDoc,
  collection, query, where, getDocs,
} from "firebase/firestore";

// ─────────────────────────────
// Generate a unique 6-char link code for a child
// e.g. "ZK-4F9A"
// ─────────────────────────────
export const generateLinkCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    if (i === 2) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. "ZK-4F9A"
};

// ─────────────────────────────
// Save link code to child's Firestore profile
// Call this when child registers
// ─────────────────────────────
export const saveChildLinkCode = async (childUid, name) => {
  try {
    const linkCode = generateLinkCode();
    const userRef = doc(db, "users", childUid);
    await setDoc(userRef, { linkCode, parentUid: null }, { merge: true });
    console.log("✅ Child link code saved:", linkCode);
    return linkCode;
  } catch (e) {
    console.log("❌ saveChildLinkCode error:", e.message);
    return null;
  }
};

// ─────────────────────────────
// Get child's link code (for showing in profile)
// ─────────────────────────────
export const getChildLinkCode = async (childUid) => {
  try {
    const snap = await getDoc(doc(db, "users", childUid));
    if (snap.exists()) return snap.data().linkCode || null;
    return null;
  } catch (e) {
    console.log("❌ getChildLinkCode error:", e.message);
    return null;
  }
};

// ─────────────────────────────
// Parent enters child's link code → link accounts
// Stores child under parents/{parentUid}/children/{childUid}
// Also updates child's profile with parentUid
// ─────────────────────────────
export const linkChildToParent = async (parentUid, parentName, linkCode) => {
  try {
    const code = linkCode.trim().toUpperCase();

    // Search for child with this link code
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("linkCode", "==", code));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, error: "No child found with this code. Check the code and try again." };
    }

    const childDoc = snap.docs[0];
    const childUid = childDoc.id;
    const childData = childDoc.data();

    if (childData.parentUid && childData.parentUid !== parentUid) {
      return { success: false, error: "This child is already linked to another parent account." };
    }

    // Save child under parent's subcollection
    const childRef = doc(db, "parents", parentUid, "children", childUid);
    await setDoc(childRef, {
      childUid,
      name: childData.name || "Child",
      linkCode: code,
      xp: childData.xp || 0,
      level: childData.level || 1,
      badge: childData.badge || "Beginner 🌱",
      linkedAt: Date.now(),
    }, { merge: true });

    // Update child's profile with parentUid
    await updateDoc(doc(db, "users", childUid), {
      parentUid,
      parentName: parentName || "Parent",
    });

    console.log("✅ Child linked to parent:", childUid, "→", parentUid);
    return { success: true, childName: childData.name || "Child", childUid };

  } catch (e) {
    console.log("❌ linkChildToParent error:", e.message);
    return { success: false, error: "Linking failed. Please try again." };
  }
};

// ─────────────────────────────
// Get all children linked to a parent
// ─────────────────────────────
export const getLinkedChildren = async (parentUid) => {
  try {
    const childrenRef = collection(db, "parents", parentUid, "children");
    const snap = await getDocs(childrenRef);
    const children = [];

    for (const childDoc of snap.docs) {
      const data = childDoc.data();
      // Also fetch fresh XP/level from child's user profile
      const freshSnap = await getDoc(doc(db, "users", data.childUid));
      const fresh = freshSnap.exists() ? freshSnap.data() : {};
      children.push({
        ...data,
        xp: fresh.xp || data.xp || 0,
        level: fresh.level || data.level || 1,
        badge: fresh.badge || data.badge || "Beginner 🌱",
        streak: fresh.streak || 0,
        completedMissions: fresh.completedMissions || 0,
      });
    }

    console.log("✅ Linked children loaded:", children.length);
    return children;
  } catch (e) {
    console.log("❌ getLinkedChildren error:", e.message);
    return [];
  }
};

// ─────────────────────────────
// Unlink a child from parent
// ─────────────────────────────
export const unlinkChild = async (parentUid, childUid) => {
  try {
    const childRef = doc(db, "parents", parentUid, "children", childUid);
    await setDoc(childRef, { unlinked: true, unlinkedAt: Date.now() }, { merge: true });
    await updateDoc(doc(db, "users", childUid), { parentUid: null });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
