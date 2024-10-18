import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CalendarModule } from 'primeng/calendar';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TreeSelectModule } from 'primeng/treeselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { GalleriaModule } from 'primeng/galleria';
import { FileUploadModule } from 'primeng/fileupload';
import { SplitButtonModule } from 'primeng/splitbutton';

@NgModule({
  exports: [
    AvatarModule,
    AutoCompleteModule,
    CommonModule,
    CardModule,
    TreeSelectModule,
    CalendarModule,
    ConfirmPopupModule,
    ConfirmDialogModule,
    FormsModule,
    FileUploadModule,
    GalleriaModule,
    ReactiveFormsModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    InputNumberModule,
    InputSwitchModule,
    PasswordModule,
    TableModule,
    TabViewModule,
    ToastModule,
    ToolbarModule,
    MenuModule,
    MenubarModule,
    InputTextareaModule,
    InputIconModule,
    IconFieldModule,
    ProgressSpinnerModule,
    FloatLabelModule,
    SplitButtonModule,
  ],
})
export class SharedModule {}
