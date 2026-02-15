"use client";
import { useQuery } from "@tanstack/react-query";
import { error } from "console";
import { promiseHooks } from "v8";
import { useUser } from "@clerk/nextjs";


export default function DashboardPage() {
 const user = useUser();

 const { data, isLoading, isError, error } = useQuery<{ id: number; name: string }[]>({
  queryKey: ["Communities"],
  queryFn: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([{ id: 1, name: "Community 1" }]);
      }, 1000);
    });
  }
});


if (isLoading) return <div>Loading...</div>;
if (isError) return <div>Error: {error?.message}</div>;

return (
  <div className="page-wrapper">
    <div>
     <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome Back {user?.user?.firstName || "User"}!</p>
    </div>
    
    {data?.map((community) => (
      <div key={community.id}>{community.name}</div>
    ))}
  </div>
);

}