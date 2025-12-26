"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocalStorage } from 'react-use';
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import type { KnownDao } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(3, "DAO name must be at least 3 characters long."),
  contractAddress: z.string().regex(/^[A-Z0-9]{20,}\.[a-zA-Z0-9-]+$/, "Invalid Stacks contract address format."),
});

export default function CreateDaoForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [myDaos, setMyDaos] = useLocalStorage<KnownDao[]>('my-daos', []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contractAddress: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newDao: KnownDao = {
      name: values.name,
      contractAddress: values.contractAddress,
    };
    
    // In a real app, this would trigger a transaction to deploy a DAO contract.
    // For this demo, we'll just save it to local storage.
    
    setMyDaos([...(myDaos || []), newDao]);
    
    toast({
      title: "DAO Registered!",
      description: `Your DAO "${values.name}" has been saved locally.`,
    });

    router.push(`/?dao=${values.contractAddress}`);
  }

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Create Your On-Chain DAO</CardTitle>
            <CardDescription>Register your existing DAO contract with the viewer. This will not deploy a new contract.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>DAO Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., My Awesome DAO" {...field} />
                    </FormControl>
                    <FormDescription>
                        A user-friendly name for your DAO.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="contractAddress"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contract Address</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., ST1PQHQKV0RJXZFY1DGX8MNSNYVE3K0702X2BGO5.my-awesome-dao" {...field} className="font-mono"/>
                    </FormControl>
                    <FormDescription>
                        The full Stacks address of your deployed DAO contract.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit">Register DAO</Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
