import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updateProfile,
  user,
  User,
  UserCredential,
  UserInfo,
} from '@angular/fire/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { concatMap, from, Observable, of } from 'rxjs';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { ProfileUser } from '../models/profile-user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);

  currentUser$: Observable<User | null> = authState(this.firebaseAuth);
  currentUser = toSignal(this.currentUser$);
  googleProvider = new GoogleAuthProvider();

  constructor(private firestore: Firestore) {}

  get userProfile$(): Observable<ProfileUser | null> {
    const user = this.firebaseAuth.currentUser;
    console.log(JSON.stringify(user, null, 2));
    const ref = doc(this.firestore, 'user', `${user?.uid}`);
    if (ref) {
      return docData(ref) as Observable<ProfileUser | null>;
    } else {
      return of(null);
    }
  }

  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  async googleSignIn(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.firebaseAuth, provider);
  }

  signup(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  setDisplayName(user: User, name: string | undefined): Promise<void> {
    return updateProfile(user, { displayName: name });
  }

  async logout(): Promise<void> {
    return await signOut(this.firebaseAuth);
  }

  async sendEmailVerification(): Promise<void | undefined> {
    const auth = getAuth();

    return await sendEmailVerification(<User>auth.currentUser);
  }

  async updateUserProfile(user: ProfileUser): Promise<void> {
    const auth = getAuth();
    const _user = auth.currentUser;

    console.log(JSON.stringify(_user, null, 2));

    if (!_user) return await Promise.resolve();

    if (user.email !== _user.email && user.email != null) {
      await updateEmail(_user, user.email);
    }

    if (user.displayName !== _user.displayName) {
      await this.setDisplayName(_user, user.displayName);
    }

    if (user.photoURL) {
      await updateProfile(auth.currentUser, {
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
  }

  updateProfile(profileData: Partial<UserInfo>): Observable<any> {
    return of(user).pipe(
      concatMap((user) => {
        if (!user) throw new Error('Not Authenticated');
        const { displayName } = profileData;
        return from(updateProfile(user, { displayName }));
      }),
    );
  }
}
