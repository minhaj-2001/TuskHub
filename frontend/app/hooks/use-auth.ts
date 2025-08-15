// frontend/app/hooks/use-auth.ts
import { postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query";
import type { User } from "@/types";

export const useSignUpMutation = () => {
  return useMutation<{ token: string; user: User }, Error, SignupFormData>({
    mutationFn: (data: SignupFormData) => postData<{ token: string; user: User }>("/auth/register", data),
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (data: { token: string }) =>
      postData("/auth/verify-email", data),
  });
};

export const useLoginMutation = () => {
  return useMutation<{ token: string; user: User }, Error, { email: string; password: string }>({
    mutationFn: (data: { email: string; password: string }) => 
      postData<{ token: string; user: User }>("/auth/login", data),
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      postData("/auth/reset-password-request", data),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => postData("/auth/reset-password", data),
  });
};



// import { postData } from "@/lib/fetch-util";
// import type { SignupFormData } from "@/routes/auth/sign-up";
// import { useMutation } from "@tanstack/react-query";

// export const useSignUpMutation = () => {
//   return useMutation({
//     mutationFn: (data: SignupFormData) => postData("/auth/register", data),
//   });
// };

// export const useVerifyEmailMutation = () => {
//   return useMutation({
//     mutationFn: (data: { token: string }) =>
//       postData("/auth/verify-email", data),
//   });
// };

// export const useLoginMutation = () => {
//   return useMutation({
//     mutationFn: (data: { email: string; password: string }) =>
//       postData("/auth/login", data),
//   });
// };

// export const useForgotPasswordMutation = () => {
//   return useMutation({
//     mutationFn: (data: { email: string }) =>
//       postData("/auth/reset-password-request", data),
//   });
// };

// export const useResetPasswordMutation = () => {
//   return useMutation({
//     mutationFn: (data: {
//       token: string;
//       newPassword: string;
//       confirmPassword: string;
//     }) => postData("/auth/reset-password", data),
//   });
// };
