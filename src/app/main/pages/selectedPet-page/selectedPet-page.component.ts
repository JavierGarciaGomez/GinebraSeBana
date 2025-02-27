import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PetService } from '../../services/pet.service';
import * as dayjs from 'dayjs';
import {
  ICounterBathInfo,
  IDictionary,
  IPet,
  IPetBath,
} from 'src/app/shared/interfaces/interfaces';

import Swal from 'sweetalert2';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';

dayjs().format();

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-main-page',
  templateUrl: './selectedPet-page.component.html',
  styles: [],
})
export class SelectedPetPageComponent implements OnInit, AfterViewInit {
  constructor(
    private petService: PetService,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.selectedPet._id) {
      this.setCounterBathInfo(this.selectedPet);
    }
    this.petService.selectedPetChange.subscribe((selectedPet) => {
      this.setCounterBathInfo(selectedPet);
    });
  }

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  _counterBathInfo: ICounterBathInfo | null = null;
  get selectedPet() {
    return this.petService.selectedPet;
  }
  get counterBathInfo() {
    return this._counterBathInfo;
  }
  get user() {
    return this.authService.user;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // this.isLoading = false;
  }

  setCounterBathInfo(selectedPet: IPet) {
    const hasRegisteredBaths =
      selectedPet.registeredBaths && selectedPet.registeredBaths.length > 0;
    let lastBathDate = null;
    let daysPassed = null;
    let nextBathDate: any = dayjs().add(selectedPet.bathPeriodicity, 'day');

    let daysLeft = nextBathDate.diff(dayjs(), 'day');
    if (hasRegisteredBaths) {
      const latestBath = selectedPet.registeredBaths.reduce(
        (prevValue, registerdBath) =>
          prevValue.date > registerdBath.date ? prevValue : registerdBath
      );
      lastBathDate = dayjs(latestBath.date);
      daysPassed = dayjs().diff(lastBathDate, 'day');
      nextBathDate = dayjs(lastBathDate).add(
        this.selectedPet.bathPeriodicity,
        'day'
      );
      daysLeft = nextBathDate.diff(dayjs(), 'day') + 1;
      // console.log(nextBathDate);
      lastBathDate = lastBathDate.toDate();
    }

    this._counterBathInfo = {
      hasRegisteredBaths,
      lastBathDate,
      daysPassed,
      nextBathDate,
      daysLeft,
    };
  }

  async registerSimplifiedBath() {
    const lastBath = {
      ...this.selectedPet.registeredBaths[
        this.selectedPet.registeredBaths.length - 1
      ],
    };

    delete lastBath._id;

    lastBath.date = new Date();

    this.petService.registerBath(lastBath);
  }

  async registerBath() {
    let bathersOptions: IDictionary = {};
    let shampoosOptions: IDictionary = {};
    let bathTypesOptions: IDictionary = {};

    this.selectedPet.bathers.forEach((element) => {
      bathersOptions[element] = element;
    });
    this.selectedPet.shampoos.forEach((element) => {
      shampoosOptions[element] = element;
    });
    this.selectedPet.bathTypes.forEach((element) => {
      bathTypesOptions[element] = element;
    });

    const batherSelect: any = await Swal.fire({
      title: '¿Quién bañó a la mascota?',
      input: 'radio',
      inputOptions: bathersOptions,
      showCancelButton: true,
    });

    const bathTypeSelect: any = await Swal.fire({
      title: '¿Qué tipo de baño se realizó?',
      input: 'radio',
      inputOptions: bathTypesOptions,
      showCancelButton: true,
    });

    const shampooSelect: any = await Swal.fire({
      title: '¿Qué champú se usó?',
      input: 'radio',
      inputOptions: shampoosOptions,
      showCancelButton: true,
    });

    const bath: IPetBath = {
      date: new Date(),
      bather: batherSelect.value,
      shampoo: shampooSelect.value,
      bathType: bathTypeSelect.value,
    };

    this.petService.registerBath(bath);
  }

  deleteBath(bathId: String) {
    const baths = this.selectedPet.registeredBaths.filter(
      (bath) => bath._id !== bathId
    );
    const selectedPet = { ...this.selectedPet };
    selectedPet.registeredBaths = [...baths];
    this.petService.updatePet(selectedPet);
  }

  editBath(bath: IPetBath) {
    this.petService.selectedBath = bath;
    this.router.navigateByUrl('/main/editBath');
  }
}
