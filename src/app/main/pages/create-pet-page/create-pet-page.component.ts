import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { convertStringToArray } from 'src/app/shared/helpers/helpers';
import { IPet } from 'src/app/shared/interfaces/interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { SharedService } from '../../../shared/services/shared.service';
import { PetService } from '../../services/pet.service';

@Component({
  selector: 'app-create-pet-page',
  templateUrl: './create-pet-page.component.html',
  styleUrls: ['./create-pet-page.component.scss'],
})
export class CreatePetPageComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private petService: PetService,
    private sharedService: SharedService,
    private router: Router
  ) {}

  myForm: FormGroup = this.formBuilder.group({
    imgUrl: [''],
    petName: ['', [Validators.required, Validators.minLength(2)]],
    bathPeriodicity: ['', Validators.required],
    isPublic: [true, Validators.required],
    shampoos: [''],
    bathTypes: [''],
    bathers: ['', Validators.required],
  });

  ngOnInit(): void {}

  invalidField(field: string) {
    return this.myForm.get(field)?.invalid && this.myForm.get(field)?.touched;
  }

  createPet() {
    const pet: IPet = this.myForm.value;

    pet.shampoos = convertStringToArray(pet.shampoos.toString());
    pet.bathers = convertStringToArray(pet.bathers.toString());
    pet.bathTypes = convertStringToArray(pet.bathTypes.toString());

    this.petService.createPet(pet);

    // const { username, email, fullName, imgUrl } = this.myForm.value;
    // this.authService
    //   .updateUser(
    //     username,
    //     email,
    //     fullName,
    //     imgUrl,
    //     this.authService.user?._id!
    //   )
    //   .subscribe((response) => {
    //     if (response.ok) {
    //       Swal.fire(
    //         'Actualizado',
    //         'El usuario ha sido actualizado con éxito',
    //         'success'
    //       );
    //       this.router.navigateByUrl('/main/userProfile');
    //     } else {
    //       Swal.fire('Error', response.message, 'error');
    //     }
    //   });
  }

  async handleImgUpload(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      const tempImg: String | null = await this.sharedService.uploadImg(
        fileList[0]
      );
      this.myForm.controls['imgUrl'].patchValue(tempImg);
    }
  }
}
