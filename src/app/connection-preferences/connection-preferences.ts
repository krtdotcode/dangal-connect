import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-connection-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './connection-preferences.html',
  styleUrl: './connection-preferences.scss',
})
export class ConnectionPreferencesComponent {
  preferencesForm: FormGroup;
  departments = [
    {
      name: 'College of Arts and Sciences',
      programs: ['Bachelor of Science in Psychology']
    },
    {
      name: 'College of Business, Accountancy and Administration',
      programs: [
        'Bachelor of Science in Accountancy',
        'Bachelor of Science in Business Administration Major in Financial Management',
        'Bachelor of Science in Business Administration Major in Marketing Management'
      ]
    },
    {
      name: 'College of Computing Studies',
      programs: [
        'Bachelor of Science in Computer Science',
        'Bachelor of Science in Information Technology'
      ]
    },
    {
      name: 'College of Education',
      programs: [
        'Bachelor of Elementary Education',
        'Bachelor of Secondary Education Major in English',
        'Bachelor of Secondary Education Major in Filipino',
        'Bachelor of Secondary Education Major in Mathematics',
        'Bachelor of Secondary Education Major in Social Sciences'
      ]
    },
    {
      name: 'College of Engineering',
      programs: [
        'Bachelor of Science in Computer Engineering',
        'Bachelor of Science in Electronics Engineering',
        'Bachelor of Science in Industrial Engineering'
      ]
    },
    {
      name: 'College of Health and Allied Sciences',
      programs: ['Bachelor of Science in Nursing']
    }
  ];
  years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Any Year'];
  selectedPrograms: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.preferencesForm = this.fb.group({
      connectWithAnyone: [false],
      preferredDepartment: [''],
      preferredProgram: [''],
      preferredYear: ['']
    });

    // Check if preferences are already set
    this.checkExistingPreferences();

    // Watch for department changes
    this.preferencesForm.get('preferredDepartment')?.valueChanges.subscribe(value => {
      const dept = this.departments.find(d => d.name === value);
      this.selectedPrograms = dept ? dept.programs : [];
      if (!this.selectedPrograms.includes(this.preferencesForm.value.preferredProgram)) {
        this.preferencesForm.patchValue({ preferredProgram: '' });
      }
    });

    // Watch for "connect with anyone" changes
    this.preferencesForm.get('connectWithAnyone')?.valueChanges.subscribe(value => {
      if (value) {
        // Clear specific preferences when "anyone" is selected
        this.preferencesForm.patchValue({
          preferredDepartment: '',
          preferredProgram: '',
          preferredYear: ''
        });
      }
      this.updateFormControlStates();
    });
  }

  private checkExistingPreferences() {
    const existingPrefs = sessionStorage.getItem('dangalConnectPreferences');
    if (existingPrefs) {
      try {
        const prefs = JSON.parse(existingPrefs);
        // If preferences exist, redirect to dashboard
        if (prefs.timestamp) {
          this.router.navigate(['/dashboard']);
          return;
        }
      } catch (error) {
        console.error('Error parsing preferences:', error);
      }
    }
    // No preferences set, stay on this page to collect them
  }

  onSubmit() {
    if (this.preferencesForm.valid) {
      const preferences = this.preferencesForm.value;

      // Store connection preferences in session storage
      const connectionPrefs = {
        connectWithAnyone: preferences.connectWithAnyone,
        preferredDepartment: preferences.connectWithAnyone ? null : preferences.preferredDepartment,
        preferredProgram: preferences.connectWithAnyone ? null : preferences.preferredProgram,
        preferredYear: preferences.connectWithAnyone ? null : preferences.preferredYear,
        timestamp: new Date().toISOString()
      };

      // Store in session storage
      sessionStorage.setItem('dangalConnectPreferences', JSON.stringify(connectionPrefs));

      // Dispatch event to notify parent component to start searching
      window.dispatchEvent(new CustomEvent('startSearchingConnection'));
    }
  }

  private updateFormControlStates(): void {
    const connectWithAnyone = this.preferencesForm.get('connectWithAnyone')?.value;

    if (connectWithAnyone) {
      // Disable specific preference controls when "connect with anyone" is selected
      this.preferencesForm.get('preferredDepartment')?.disable();
      this.preferencesForm.get('preferredProgram')?.disable();
      this.preferencesForm.get('preferredYear')?.disable();
    } else {
      // Enable specific preference controls when "connect with anyone" is not selected
      this.preferencesForm.get('preferredDepartment')?.enable();
      this.preferencesForm.get('preferredProgram')?.enable();
      this.preferencesForm.get('preferredYear')?.enable();
    }
  }

  get isFormValid(): boolean {
    const formValue = this.preferencesForm.value;
    if (formValue.connectWithAnyone) {
      return true; // Valid when "connect with anyone" is selected
    }
    // When specific preferences are selected, all fields must be filled
    return formValue.preferredDepartment &&
           formValue.preferredProgram &&
           formValue.preferredYear;
  }

  ngOnInit(): void {
    // Update form control states initially
    this.updateFormControlStates();
  }
}
