"use client";

import { useMutation } from "@apollo/client";
import {
  REMOVE_USER_MUTATION,
  UPDATE_USER_MUTATION,
} from "@/modules/graph/apollo/mutation/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ProfileImageUpload } from "@/core/components/shared/profile-upload";
import { Button } from "@/core/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Separator } from "@/core/components/ui/separator";
import { TabsContent } from "@/core/components/ui/tabs";
import { toast } from "@/core/hooks/use-toast";
import { useAuth } from "@/core/providers/auth";
import * as z from "zod";
import {
  updateProfile,
  User,
  deleteUser as deleteFirebaseUser,
  updateEmail,
} from "firebase/auth";
import { getAuth } from "firebase/auth";
import { storage } from "@/core/configs/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "@/core/providers/user";
import { Skeleton } from "@/core/components/ui/skeleton";

const profileFormSchema = z.object({
  firstName: z.string().min(1, {
    message: "First name must be at least 1 character.",
  }),
  lastName: z.string().min(1, {
    message: "Last name must be at least 1 character.",
  }),
  picture: z.string().url().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileForm = () => {
  const { user, refreshToken } = useAuth();
  const { user: currentUser, loading } = useUser();
  const [updateUser, { error: updateError }] = useMutation(UPDATE_USER_MUTATION);
  const [isInitialized, setIsInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isGoogleUser = user?.firebase?.sign_in_provider === "google.com";

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email:  "",
      picture: "",
    },
  });

  useEffect(() => {
    if (loading) return; // Wait for user data to load
    if (currentUser && !isInitialized) {
      form.reset({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: user?.email || "",
        picture: user?.picture || "",
      });
      setIsInitialized(true);
    }
  }, [currentUser, form, isInitialized, loading, user]);

  useEffect(() => {
    if (updateError?.graphQLErrors[0]?.message) {
      toast({
        title: "Error",
        description: updateError.graphQLErrors[0].message,
        variant: "destructive",
      });
      console.log("graphql error", updateError);
    }
  }, [updateError]);

  const handleProfileUpdate = async (data: ProfileFormValues) => {
    updateUser({
      variables: {
        updateUserInput: {
          id: user?.user_id ?? "",
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
    }).then(async () => {
      if (user) {
        await updateProfile(getAuth().currentUser as User, {
          displayName: `${data.firstName} ${data.lastName}`.trim(),
        });
        if (data.email && data.email !== user.email) {
          await updateEmail(getAuth().currentUser as User, data.email);
        }
      }
      await refreshToken();
      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved.",
      });
    });
  };

  const handleProfilePictureUpdate = async (data: ProfileFormValues) => {
    try {
      let photoURL = data.picture;
      if (selectedFile) {
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB in bytes
          toast({
            title: "File too large",
            description: "Profile image must be less than 5MB.",
            variant: "destructive",
          });
          return;
        }
        // Use the storage instance from firebase.ts and uploadBytes with Blob (File)
        const path = `avatars/${user?.user_id || user?.email || "profile"}`;
        const imgRef = storageRef(storage, path);
        await uploadBytes(imgRef, selectedFile); // upload as Blob/File
        photoURL = await getDownloadURL(imgRef);
      }
      if (user && photoURL) {
        await updateProfile(getAuth().currentUser as User, {
          photoURL,
        });
      }
      await refreshToken();
      toast({
        title: "Profile picture updated successfully!",
        description: "Your profile picture has been saved.",
      });
      setSelectedFile(null);
    } catch (err) {
      toast({
        title: "Error updating profile picture",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  const removeProfilePicture = async () => {
    try {
      if (user) {
        await updateProfile(getAuth().currentUser as User, { photoURL: null });
      }
      form.setValue("picture", "", { shouldValidate: true });
      setSelectedFile(null);
      await refreshToken();
      toast({
        title: "Profile picture removed!",
        description: "Your profile picture has been removed.",
      });
    } catch (err) {
      toast({
        title: "Error removing profile picture",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <TabsContent value="profile">
        <div className="space-y-8 mb-12">
          <div className="my-8">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full col-span-1" />
            <Skeleton className="h-10 w-full col-span-1" />
            <Skeleton className="h-10 w-full col-span-2" />
          </div>
          <Skeleton className="h-10 w-24 mt-4" />
        </div>
        <div className="space-y-8">
          <div className="my-5">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-32 w-32 rounded-full mx-auto my-8" />
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="profile">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleProfileUpdate)}
          className="space-y-8 mb-12"
        >
          <div className="my-8">
            <h2 className="text-xl font-medium">Account</h2>
            <p className="text-sm ">Update Your Account Information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-3 col-span-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel htmlFor="firstName" className="block text-sm font-medium">First Name</FormLabel>
                    <FormControl>
                      <Input id="firstName" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel htmlFor="lastName" className="block text-sm font-medium">Last Name</FormLabel>
                    <FormControl>
                      <Input id="lastName" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              disabled={isGoogleUser}
              render={({ field }) => (
                <FormItem className="space-y-2 col-span-2">
                  <FormLabel htmlFor="email" className="block text-sm font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input id="email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit">
            Update
          </Button>
        </form>
      </Form>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleProfilePictureUpdate)}
          className="space-y-8"
        >
          <div className="my-5">
            <h2 className="text-xl font-medium">Profile Picture</h2>
            <p className="text-sm ">Update your profile Picture</p>
          </div>
          <Separator className="my-8" />

          <FormField
            control={form.control}
            name="picture"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <div className="my-5 me-4">
                        <h3 className=" font-medium">Your photo</h3>
                        <p className="text-sm ">This will be displayed on your photo</p>
                      </div>
                      <div className="relative">
                        <ProfileImageUpload
                          value={field.value}
                          defaultValue={user?.picture}
                          onChange={(value: string | undefined) => {
                            field.onChange(value);
                            form.setValue("picture", value, { shouldValidate: true });
                          }}
                          name={"picture"}
                          fileInputRef={fileInputRef}
                          showSaveButton={field.value !== user?.picture}
                          onSave={() => form.handleSubmit(handleProfilePictureUpdate)()}
                          userName={user?.name}
                          setSelectedFile={setSelectedFile}
                          onRemove={removeProfilePicture}
                        />
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              );
            }}
          />
        </form>
      </Form>
    </TabsContent>
  );
};

export default ProfileForm;
