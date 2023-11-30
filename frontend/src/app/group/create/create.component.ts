import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {finalize} from "rxjs";
import {CreateGroup, GroupService} from "../group.service";
import {ToastController} from "@ionic/angular";
import {HttpEventType} from "@angular/common/http";
import {refresh} from "ionicons/icons";


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent  implements OnInit {

  uploading: boolean = false;
  uploadProgress: number | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  hasUploaded: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly service: GroupService,
    private readonly toast: ToastController,
  ) { }

  ngOnInit() {
  }

  protected readonly _now = new Date().toLocaleDateString("da-DK", {timeZone: 'UTC'});

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    image: [null as File | null],
  });

  get name() {
    return this.form.controls.name;
  }

  get description() {
    return this.form.controls.description;
  }

  onFileChanged($event: Event) {
    const files = ($event.target as HTMLInputElement).files;
    if (!files) return;
    this.form.patchValue({image: files[0]});
    this.form.controls.image.updateValueAndValidity();
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.imageUrl = reader.result;
    }
    this.hasUploaded = true;
  }

  async submit() {
    if (this.form.invalid) return;
    this.uploading = true;
    this.service.create(this.form.value as CreateGroup)
      .pipe(finalize(() => {
        this.uploading = false;
        this.uploadProgress = null;
      }))
      .subscribe(event => {
        if (event.type == HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / (event.total ?? 1)))
        } else if (event.type == HttpEventType.Response && event.body) {
          this.form.patchValue(event.body);
        }
      });

    await (await this.toast.create({
      message: "Your group was created successfully",
      color: "success",
      duration: 5000
    })).present();
  }
}
