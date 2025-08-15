// frontend/app/hooks/useUserManagement.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchData, postData, updateData } from "@/lib/fetch-util";
import type { User } from "@/types";

export const useReferredUsers = () => {
  return useQuery<User[]>({
    queryKey: ["referred-users"],
    queryFn: () => fetchData("/users/referred-users"),
  });
};

export const useToggleUserStatus = () => {
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      updateData(`/users/users/${userId}/toggle-status`, {}),
  });
};

export const useGetReferralLink = () => {
  return useQuery<{ referralLink: string }>({
    queryKey: ["referral-link"],
    queryFn: () => fetchData("/users/referral-link"),
  });
};