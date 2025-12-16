"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_CONFIG, PRICING_CONFIG, CALL_OUTCOMES, CALL_SENTIMENTS } from "@/lib/constants";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [apiTimeout, setApiTimeout] = useState<number>(API_CONFIG.TIMEOUT);
  const [maxRounds, setMaxRounds] = useState<number>(PRICING_CONFIG.MAX_NEGOTIATION_ROUNDS);
  const [maxBuffer, setMaxBuffer] = useState<number>(PRICING_CONFIG.MAX_BUFFER_AMOUNT);
  const [bufferPercentage, setBufferPercentage] = useState<number>(PRICING_CONFIG.BUFFER_PERCENTAGE * 100);

  const handleSave = () => {
    // Here it would be saved to localStorage or a database
    localStorage.setItem("app_settings", JSON.stringify({
      apiTimeout,
      maxRounds,
      maxBuffer,
      bufferPercentage: bufferPercentage / 100,
    }));
    alert("Settings saved (simulated - in production would be saved to DB)");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Application settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-timeout">Timeout (ms)</Label>
              <Input
                id="api-timeout"
                type="number"
                value={apiTimeout}
                onChange={(e) => setApiTimeout(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum wait time for API responses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-rounds">Max Negotiation Rounds</Label>
              <Input
                id="max-rounds"
                type="number"
                min="1"
                max="10"
                value={maxRounds}
                onChange={(e) => setMaxRounds(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-buffer">Max Buffer ($)</Label>
              <Input
                id="max-buffer"
                type="number"
                min="0"
                value={maxBuffer}
                onChange={(e) => setMaxBuffer(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer-percentage">Buffer Percentage (%)</Label>
              <Input
                id="buffer-percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={bufferPercentage}
                onChange={(e) => setBufferPercentage(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Constants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Call Outcomes</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CALL_OUTCOMES.map((outcome) => (
                      <TableRow key={outcome}>
                        <TableCell className="font-mono text-sm">{outcome}</TableCell>
                        <TableCell>{outcome.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Sentiments</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CALL_SENTIMENTS.map((sentiment) => (
                      <TableRow key={sentiment}>
                        <TableCell className="font-mono text-sm">{sentiment}</TableCell>
                        <TableCell>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

