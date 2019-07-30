import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { map } from 'rxjs/operators';
import { User } from './user.model';
import { Store } from '@ngrx/store'
import { AppState } from '../app.reducer'
import { ActivarLoadingAction, DesactivarLoadingAction } from '../shared/ui.actions'
import { SetUserAction } from './auth.actions'
import { Subscription } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubscription: Subscription = new Subscription()

  constructor(private afAuth: AngularFireAuth,
    private router: Router,
    private afDB: AngularFirestore,
    private store: Store<AppState>) { }

  initAuthListener() {
    this.afAuth.authState.subscribe(fbUser => {
      if (fbUser) {
        this.userSubscription = this.afDB.doc(`${fbUser.uid}/usuario`).valueChanges()
          .subscribe((usuarioObj: any) => {
            const newUser = new User(usuarioObj)
            this.store.dispatch(new SetUserAction(newUser))
          })
      } else {
        this.userSubscription.unsubscribe()
      }
    });
  }

  crearUsuario(nombre: string, email: string, password: string) {

    this.store.dispatch(new ActivarLoadingAction())

    this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then((res) => {

        const user: User = {
          uid: res.user.uid,
          nombre: nombre,
          email: res.user.email
        }

        this.afDB.doc(`${user.uid}/usuario`)
          .set(user)
          .then(() => {
            this.router.navigate(['/']);
            this.store.dispatch(new DesactivarLoadingAction())
          });
      })
      .catch(err => {
        // console.error(err);
        this.store.dispatch(new DesactivarLoadingAction())
        Swal.fire('error en el login', err.message, 'error');
      });
  }

  loggearUsuario(email: string, password: string) {

    this.store.dispatch(new ActivarLoadingAction())

    this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.store.dispatch(new DesactivarLoadingAction())
        this.router.navigate(['/']);
      })
      .catch(err => {
        this.store.dispatch(new DesactivarLoadingAction())
        Swal.fire('error en el login', err.message, 'error');
      });
  }

  logout() {
    this.router.navigate(['/login']);
    this.afAuth.auth.signOut();
  }

  isAuth() {
    return this.afAuth.authState
      .pipe(
        map(fbUser => {
          if (fbUser == null) this.router.navigate(['/login']);

          return fbUser !== null
        })
      )
  }
}
