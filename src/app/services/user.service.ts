import { inject, Injectable } from '@angular/core';
import {
  doc,
  docData,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { ProfileUser } from '../models/profile-user.model';
import { from, Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { MessagesService } from './messages.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth } from '@angular/fire/auth';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore = inject(Firestore);
  authService = inject(AuthService);
  afAuth = inject(Auth);
  message = inject(MessagesService);
  router = inject(Router);
  storage = inject(Storage);

  private currentUserProfile$: Observable<ProfileUser | null> =
    this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user) {
          return of(null);
        }
        const ref = doc(this.firestore, 'user', user?.uid);
        return docData(ref) as Observable<ProfileUser>;
      }),
    );
  currentUserProfile = toSignal(this.currentUserProfile$);

  addUser(user: ProfileUser): Observable<void> {
    const userRole = {
      ...user,
      role: user.role || 'user',
    };
    console.log(JSON.stringify(userRole, null, 2));
    const docRef = doc(this.firestore, 'user', user.uid);
    return from(setDoc(docRef, userRole));
  }

  updateUser(user: ProfileUser): Promise<void> {
    const ref = doc(this.firestore, 'user', user.uid);
    return updateDoc(ref, { ...user });
  }

  async uploadProfilePhoto(image: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    const result = await uploadBytes(storageRef, image);
    return await getDownloadURL(result.ref);
  }
}
