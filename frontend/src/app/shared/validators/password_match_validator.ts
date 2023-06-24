import { AbstractControl } from '@angular/forms';

export function PasswordsMatchValidator(password: string, confirmPassword: string) {
    return (control: AbstractControl) => {
        const passwordControl = control.get(password);
        const confirmPasswordControl = control.get(confirmPassword);

        if (!passwordControl || !confirmPasswordControl) {
            return null;
        }

        if (passwordControl.value !== confirmPasswordControl.value) {
            confirmPasswordControl.setErrors({ passwordsMatch: true });
            return { passwordsMatch: true };
        } else {
            const errors = confirmPasswordControl.errors;
            if (errors) {
                delete errors.passwordsMatch;
                if (!Object.keys(errors).length) {
                    confirmPasswordControl.setErrors(null);
                }
            }
        }

        return null;
    }
}
