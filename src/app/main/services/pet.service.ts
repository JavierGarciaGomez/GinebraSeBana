import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import {
  IGetMultiplePetsResponse,
  IPetBath,
  ISinglePetResponse,
} from '../../shared/interfaces/interfaces';
import {
  IgetLinkedPetsResponse,
  IgetPetByIdResponse,
  ILinkedUser,
  IPet,
} from 'src/app/shared/interfaces/interfaces';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { addImgAndAuthorizationsToPet } from 'src/app/shared/helpers/helpers';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private router: Router
  ) {
    this.setSelectedPet();

    this.userLinkedPetsChange.subscribe((userLinkedPets) => {
      this._userLinkedPets = userLinkedPets;
      this.setSelectedPet();
    });
    this.selectedPetChange.subscribe((pet) => {
      // console.log('selected pet change', pet);
      this._selectedPet = pet;
    });
    this.authService.userChange.subscribe((user) => {
      this.getLinkedPetsByUser();
      this.setSelectedPet();
    });
  }
  userLinkedPetsChange: Subject<IPet[]> = new Subject<IPet[]>();
  selectedPetChange: Subject<IPet> = new Subject<IPet>();
  private baseUrl: string = `${environment.baseUrl}/pets`;
  private _userLinkedPets: IPet[] = [];
  private _selectedPet!: IPet;
  private _publicPets: IPet[] = [];

  get publicPets() {
    return this._publicPets;
  }
  get user() {
    return this.authService.user;
  }
  ginebraId = '62fbc56a7ac3e2b536ed1153';
  public selectedBath: IPetBath | null = null;

  routes = {
    createPet: '/createPet',
    getPublicPets: '/getPublicPets',
    getAllPets: '/getAllPets',
    getGinebra: '/getGinebra',
    getPetById: '/getPetById/', // petID
    getLinkedPetsByUser: '/getLinkedPetsByUser/', // :userId
    updatePet: '/updatePet/', // petID
    linkPublicPetToUser: '/linkPublicPetToUser/', // petID
    linkUser: '/linkUser/', // petID
    deletePet: '/deletePet/', // petID
    registerBath: '/registerBath/', // petID
  };
  get userLinkedPets() {
    return this._userLinkedPets;
  }
  get selectedPet() {
    const pet = { ...this._selectedPet };
    if (!pet.imgUrl || pet.imgUrl === '')
      pet.imgUrl = 'assets/images/unknownPet.jpg';

    return pet;
  }

  createPet(pet: IPet) {
    const url = `${this.baseUrl}${this.routes.createPet}`;
    const body = { ...pet };
    const headers = new HttpHeaders().set(
      'x-token',
      localStorage.getItem('token') || ''
    );

    return this.httpClient
      .post<ISinglePetResponse>(url, body, { headers })
      .subscribe((resp) => {
        if (resp.ok) {
          Swal.fire('Mascota creada con éxito', resp.message, 'success');
          const updatedPet = addImgAndAuthorizationsToPet(
            resp.pet,
            this.authService.user?._id!
          );
          this.selectedPetChange.next(updatedPet);
          this.router.navigateByUrl('main/selectedPet');
        } else {
          Swal.fire('Error', resp.message, 'error');
        }
      });
  }

  getPublicPets() {
    const url = `${this.baseUrl}${this.routes.getPublicPets}`;
    this.httpClient
      .get<IGetMultiplePetsResponse>(url)
      .pipe(
        tap(),
        catchError((err: HttpErrorResponse) => {
          return of(err.error);
        })
      )
      .subscribe((resp: IGetMultiplePetsResponse) => {
        if (resp.ok) {
          const { pets } = resp;
          const newPets = pets.forEach((pet) => {
            addImgAndAuthorizationsToPet(pet, '');
          });
          this._publicPets = pets;
        }
      });
  }

  getGinebra() {
    const url = `${this.baseUrl}${this.routes.getGinebra}`;

    this.httpClient
      .get<IgetPetByIdResponse>(url)
      .pipe(
        tap(),
        catchError((err: HttpErrorResponse) => {
          return of(err.error);
        })
      )
      .subscribe((resp: IgetPetByIdResponse) => {
        if (resp.ok) {
          const { pet } = resp;
          if (!pet.imgUrl || pet.imgUrl === '') {
            pet.imgUrl = 'assets/images/unknownPet.jpg';
          }

          this.selectedPetChange.next(pet);
        }
      });
  }

  getPetById(petId: string = '62f4bea5ad3a2957faa248ed') {
    const url = `${this.baseUrl}${this.routes.getPetById}${petId}`;
    const headers = new HttpHeaders().set(
      'x-token',
      localStorage.getItem('token') || ''
    );
    this.httpClient
      .get<IgetPetByIdResponse>(url, { headers })
      .pipe(
        tap(),
        catchError((err: HttpErrorResponse) => {
          return of(err.error);
        })
      )
      .subscribe((resp: IgetPetByIdResponse) => {
        if (resp.ok) {
          const { pet } = resp;
          const updatedPet = addImgAndAuthorizationsToPet(
            resp.pet,
            this.authService.user?._id!
          );
          this.selectedPetChange.next(updatedPet);
        }
      });
  }

  getLinkedPetsByUser(userId: string = '') {
    if (userId === '' || !userId) {
      userId = this.authService.user?._id!;
    }

    const url = `${this.baseUrl}${this.routes.getLinkedPetsByUser}${userId}`;
    const headers = new HttpHeaders().set(
      'x-token',
      localStorage.getItem('token') || ''
    );
    this.httpClient
      .get<IgetLinkedPetsResponse>(url, { headers })
      .pipe(
        tap(),
        catchError((err: HttpErrorResponse) => {
          return of(err.error);
        })
      )
      .subscribe((resp: IgetLinkedPetsResponse) => {
        if (resp.ok) {
          const petsWithImgUrl = resp.pets.map((pet) =>
            addImgAndAuthorizationsToPet(pet, userId)
          );
          this.userLinkedPetsChange.next(petsWithImgUrl);
        }
      });
  }

  updatePet(pet: IPet, petId: string = '') {
    petId = petId !== '' ? petId : this.selectedPet._id;

    const url = `${this.baseUrl}${this.routes.updatePet}${petId}`;
    const body = { ...pet };
    const headers = new HttpHeaders().set(
      'x-token',
      localStorage.getItem('token') || ''
    );

    return this.httpClient
      .put<ISinglePetResponse>(url, body, { headers })
      .subscribe((resp) => {
        if (resp.ok) {
          Swal.fire('Éxito', resp.message, 'success');
          const updatedPet = addImgAndAuthorizationsToPet(
            resp.pet,
            this.authService.user?._id!
          );
          this.selectedPetChange.next(updatedPet);
          this.getLinkedPetsByUser();
        } else {
          Swal.fire('Error', resp.message, 'error');
        }
      });
  }

  linkUser(newLinkUser: {}, petId: string = '') {
    petId = petId !== '' ? petId : this.selectedPet._id;
    const url = `${this.baseUrl}${this.routes.linkUser}${petId}`;
    const headers = new HttpHeaders().set(
      'x-token',
      localStorage.getItem('token') || ''
    );
    const body = { ...newLinkUser };

    return this.httpClient
      .put<ISinglePetResponse>(url, body, { headers })
      .subscribe((resp) => {
        if (resp.ok) {
          this.getLinkedPetsByUser();
          const updatedPet = addImgAndAuthorizationsToPet(
            resp.pet,
            this.authService.user?._id!
          );
          this.selectedPetChange.next(updatedPet);
        } else {
          Swal.fire('Error', resp.message, 'error');
        }
      });
  }

  deletePet(petId: string = '') {
    petId = petId !== '' ? petId : this.selectedPet._id;
    const url = `${this.baseUrl}${this.routes.deletePet}${petId}`;

    const headers = new HttpHeaders().set(
      'x-token',
      localStorage.getItem('token') || ''
    );

    return this.httpClient
      .delete<ISinglePetResponse>(url, { headers })
      .subscribe((resp) => {
        if (resp.ok) {
          this.getLinkedPetsByUser(this.authService.user?._id!);
          let newSelectedPet = null;
          if (this._userLinkedPets.length > 0) {
            this.selectedPetChange.next(this._userLinkedPets[0]);
          } else {
            this.getPetById(this.ginebraId);
          }
        } else {
          Swal.fire('Error', resp.message, 'error');
        }
      });
  }

  registerBath(petBath: IPetBath) {
    const url = `${this.baseUrl}${this.routes.registerBath}${this.selectedPet._id}`;
    const body = { ...petBath };
    const headers = new HttpHeaders().set(
      'x-token',
      localStorage.getItem('token') || ''
    );

    return this.httpClient
      .post<ISinglePetResponse>(url, body, { headers })
      .subscribe((resp) => {
        if (resp.ok) {
          const updatedPet = addImgAndAuthorizationsToPet(
            resp.pet,
            this.authService.user?._id!
          );
          this.selectedPetChange.next(updatedPet);

          this.router.navigateByUrl('main/selectedPet');
        } else {
          Swal.fire('Error', resp.message, 'error');
        }
      });
  }

  setSelectedPet() {
    if (!this.user) {
      this.getGinebra();
      return;
    }
    if (this.user) {
      if (this.userLinkedPets && this.userLinkedPets.length > 0) {
        const linkedPetExist = this.userLinkedPets.find(
          (userLinkedPet) => userLinkedPet._id === this._selectedPet._id
        );
        if (linkedPetExist && this.selectedPet._id !== this.ginebraId) {
          return;
        }
        this.selectedPetChange.next(this.userLinkedPets[0]);
        return;
      }
      this.getGinebra();
    }
  }
}
