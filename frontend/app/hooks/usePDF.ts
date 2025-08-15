import { useMutation } from "@tanstack/react-query";
import { postData } from "@/lib/fetch-util";

export const useShareProjectPDF = () => {
  return useMutation({
    mutationFn: (data: { projectId: string }) =>
      postData("/projects/preview-project-pdf", data),
  });
};

export const useSendProjectPDF = () => {
  return useMutation({
    mutationFn: (data: { projectId: string; emailIds: string[]; pdfData: string }) =>
      postData("/projects/send-project-pdf", data),
  });
};