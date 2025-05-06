"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { SocialProvider } from "@/types/social";

interface SocialConnection {
  provider: string;
  providerAccountId: string;
  metadata?: Record<string, unknown>;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openAIKey, setOpenAIKey] = useState("");
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prevent hydration mismatch by only rendering theme selector after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to fetch social connections
  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/social/connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  useEffect(() => {
    // Check for success or error messages from OAuth callback
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast.success(success);
      // Refresh connections after successful connection
      fetchConnections();
      // Clear the URL parameters
      router.replace('/settings');
    } else if (error) {
      toast.error(error);
      // Clear the URL parameters
      router.replace('/settings');
    }
  }, [searchParams, router]);

  // Initial fetch of connections
  useEffect(() => {
    fetchConnections();
  }, []);

  const handleConnect = async (provider: string) => {
    setIsLoading(true);
    try {
      if (provider === SocialProvider.LINKEDIN) {
        window.location.href = '/api/social/linkedin/connect';
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect to social media');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/social/linkedin/disconnect`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Successfully disconnected from LinkedIn');
        // Refresh connections after disconnecting
        await fetchConnections();
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      toast.error('Failed to disconnect from social media');
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = (provider: string) => {
    return connections.some(conn => conn.provider === provider);
  };

  if (!mounted) {
    return null; // Return nothing on first render to avoid hydration mismatch
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how LeverCast looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for various services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
              />
              <p className="text-sm text-muted-foreground">
                Your API key is stored securely and never shared
              </p>
            </div>
            <Button onClick={() => console.log("Save API key")}>
              Save API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Connections</CardTitle>
          <CardDescription>
            Connect your social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Twitter</h3>
                <p className="text-sm text-muted-foreground">
                  Not connected
                </p>
              </div>
              <Button variant="outline" disabled>Connect</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">LinkedIn</h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected(SocialProvider.LINKEDIN) ? 'Connected' : 'Not connected'}
                </p>
              </div>
              <Button
                variant={isConnected(SocialProvider.LINKEDIN) ? "destructive" : "outline"}
                onClick={() => isConnected(SocialProvider.LINKEDIN) 
                  ? handleDisconnect()
                  : handleConnect(SocialProvider.LINKEDIN)
                }
                disabled={isLoading}
              >
                {isConnected(SocialProvider.LINKEDIN) ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Instagram</h3>
                <p className="text-sm text-muted-foreground">
                  Not connected
                </p>
              </div>
              <Button variant="outline" disabled>Connect</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
              />
            </div>
            <Button>Update Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 