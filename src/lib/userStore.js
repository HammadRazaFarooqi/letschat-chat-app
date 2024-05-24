import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import {db} from "./firebase"

export const useUserStore = create((set) => ({
  currentUser:null,
 fetchUserInfo: async (uid)=>{
    if(!uid) return set({currentUser:null})
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
            return set({currentUser: docSnap.data()});
            } else {
            return set({ currentUser: null});
            }
} catch (error) {
    console.error(error);
    if(!uid) return set({currentUser:null})
}
 }
}))
