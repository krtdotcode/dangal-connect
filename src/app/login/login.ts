import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
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
  years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  selectedPrograms: string[] = [];

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      department: ['', Validators.required],
      program: ['', Validators.required],
      year: ['', Validators.required]
    });

    this.loginForm.get('department')?.valueChanges.subscribe(value => {
      const dept = this.departments.find(d => d.name === value);
      this.selectedPrograms = dept ? dept.programs : [];
      this.loginForm.patchValue({ program: '' });
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Login Data:', this.loginForm.value);
    }
  }
}
