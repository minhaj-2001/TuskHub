import { signInSchema, signUpSchema } from "@/lib/schema";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useSignUpMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, UserPlus } from "lucide-react";

export type SignupFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  const [isReferral, setIsReferral] = useState(false);
  const [referralInfo, setReferralInfo] = useState<{ name: string; email: string } | null>(null);
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    },
  });
  
  const { mutate, isPending } = useSignUpMutation();
  
  // Check if this is a referral signup and fetch manager info
  useEffect(() => {
    if (ref) {
      setIsReferral(true);
      // In a real app, you would fetch the manager info here
      // For now, we'll just show a generic message
      setReferralInfo({
        name: "Manager",
        email: "manager@example.com"
      });
    }
  }, [ref]);
  
  const handleOnSubmit = (values: SignupFormData) => {
    // Add referral ID to the form data if present
    const signupData = ref ? { ...values, ref } : values;
    
    mutate(signupData, {
      onSuccess: () => {
        toast.success("Email Verification Required", {
          description:
            "Please check your email for a verification link. If you don't see it, please check your spam folder.",
        });
        form.reset();
        navigate("/sign-in");
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error);
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <h1 className="text-2xl font-bold">
            {isReferral ? "Join Your Team" : "Create an account"}
          </h1>
          <CardDescription className="text-sm text-muted-foreground">
            {isReferral 
              ? "You've been invited to join a team. Create your account to get started."
              : "Create an account to continue"
            }
          </CardDescription>
        </div>
        
        {isReferral && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You're signing up as a team member. You'll be able to view projects but not modify them.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center mb-5">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6" />
              {isReferral ? "Join Team" : "Sign Up"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleOnSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Minhajul Islam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Signing up..." : (isReferral ? "Join Team" : "Sign up")}
                </Button>
              </form>
            </Form>
            <CardFooter className="flex items-center justify-center mt-6">
              <div className="flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account? <Link to="/sign-in">Sign in</Link>
                </p>
              </div>
            </CardFooter>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;