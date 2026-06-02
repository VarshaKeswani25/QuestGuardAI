// services/missionService.js
import { db } from './firebaseConfig';
import {
  collection, doc, setDoc, getDoc, getDocs,
  query, orderBy, where, updateDoc, addDoc, deleteDoc
} from 'firebase/firestore';
import { addXP } from './userService';

// ─────────────────────────────
// Sync AI missions — pehle purani delete, phir naye save
// ─────────────────────────────
export const syncMissionsToFirestore = async (userId, missions) => {
  try {
    if (!userId || !missions?.length) return;

    // Pehle saari purani missions delete karo
    const missionsRef = collection(db, 'users', userId, 'missions');
    const oldSnap = await getDocs(missionsRef);
    for (const oldDoc of oldSnap.docs) {
      await deleteDoc(oldDoc.ref);
    }

    // Ab naye backend missions save karo
    const batch = missions.map(async (m) => {
      const mRef = doc(db, 'users', userId, 'missions', m.id);
      await setDoc(mRef, {
        ...m,
        status: 'active',
        completedAt: null,
        createdAt: Date.now(),
        source: 'ai',
      });
    });
    await Promise.all(batch);
    console.log('✅ Missions synced to Firestore:', missions.length);
  } catch (e) {
    console.log('❌ syncMissions error:', e.message);
  }
};

// ─────────────────────────────
// Get missions — sirf latest AI wali
// ─────────────────────────────
export const getUserMissions = async (userId, filter = 'all') => {
  try {
    if (!userId) return [];
    const missionsRef = collection(db, 'users', userId, 'missions');
    const snap = await getDocs(query(missionsRef, orderBy('createdAt', 'desc')));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (filter === 'all') return all;
    return all.filter(m => m.status === filter);
  } catch (e) {
    console.log('❌ getUserMissions error:', e.message);
    return [];
  }
};

// ─────────────────────────────
// Complete mission + XP
// ─────────────────────────────
export const completeMission = async (userId, missionId, xpEarned) => {
  try {
    if (!userId || typeof xpEarned !== 'number') return null;
    const mRef = doc(db, 'users', userId, 'missions', missionId);
    await setDoc(mRef, {
      status: 'completed',
      completedAt: Date.now(),
      xpEarned,
    }, { merge: true });
    const updatedProfile = await addXP(userId, xpEarned);
    console.log('✅ Mission completed:', missionId, '+', xpEarned, 'XP');
    return updatedProfile;
  } catch (e) {
    console.log('❌ completeMission error:', e.message);
    return null;
  }
};

// ─────────────────────────────
// Parent approve/reject
// ─────────────────────────────
export const parentApproveMission = async (parentUid, childUid, missionId, approve = true) => {
  try {
    const status = approve ? 'approved' : 'rejected';
    const mRef = doc(db, 'users', childUid, 'missions', missionId);
    await setDoc(mRef, {
      status,
      reviewedBy: parentUid,
      reviewedAt: Date.now(),
    }, { merge: true });
    const approvalRef = doc(db, 'questApprovals', `${childUid}_${missionId}`);
    await setDoc(approvalRef, {
      childUid, missionId, status,
      approvedBy: parentUid,
      reviewedAt: Date.now(),
    }, { merge: true });
    console.log(`✅ Mission ${status} by parent`);
    return { success: true, status };
  } catch (e) {
    console.log('❌ parentApproveMission error:', e.message);
    return { success: false };
  }
};

// ─────────────────────────────
// Pending missions for parent
// ─────────────────────────────
export const getPendingMissions = async (childUid) => {
  try {
    if (!childUid) return [];
    const missionsRef = collection(db, 'users', childUid, 'missions');
    const snap = await getDocs(missionsRef);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(m => ['completed', 'approved', 'rejected'].includes(m.status));
  } catch (e) {
    console.log('❌ getPendingMissions error:', e.message);
    return [];
  }
};