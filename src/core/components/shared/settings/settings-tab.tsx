import ApiManagementForm from "@/core/components/shared/settings/forms/api-management";
import ProfileForm from "@/core/components/shared/settings/forms/profile";
import PasswordForm from "@/core/components/shared/settings/forms/password";
import PlanAndBillingForm from "@/core/components/shared/settings/forms/plan-and-billing";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { useAuth } from "@/core/providers/auth";
import { useRouter, useSearchParams } from "next/navigation";
import RoleManagement from "./forms/role-management";
import { GET_CURRENT_USER } from "@/modules/graph/apollo/query/user";
import { useQuery } from "@apollo/client";

const SettingsTab = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(tabFromQuery);
  const { user } = useAuth();
  const isGoogleUser = user?.firebase?.sign_in_provider === "google.com";

  const { data } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "cache-first", // Changed from network-only for better performance
  });

  const userRole = data?.user?.role;

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="">
      <div className="container px-4 py-8 flex flex-col h-[90vh]">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm mt-1">
          Manage your Personal and Integrated data&apos;s
        </p>

        <Tabs
          value={activeTab}
          className="mt-6"
          onValueChange={handleTabChange}
        >
          <TabsList className="border-b border-gray-200 w-full justify-start bg-transparent p-0">
            <TabsTrigger value="profile" variant={"underlined"}>
              Profile
            </TabsTrigger>
            {!isGoogleUser && (
              <TabsTrigger value="password" variant="underlined">
                Password
              </TabsTrigger>
            )}
            <TabsTrigger value="billing" variant="underlined">
              Plan & Billing
            </TabsTrigger>
            {/* <TabsTrigger value="appearance" variant="underlined">
              Appearance
            </TabsTrigger> */}
            {/* <TabsTrigger value="api" variant="underlined">
              API Management
            </TabsTrigger> */}
            {userRole === "OWNER" && (
              <TabsTrigger value="role-management" variant="underlined">
                Role Management
              </TabsTrigger>
            )}
          </TabsList>
          <ProfileForm />
          {!isGoogleUser && <PasswordForm />}
          {/* <ApiManagementForm /> */}
          <PlanAndBillingForm />
          <RoleManagement />
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsTab;
