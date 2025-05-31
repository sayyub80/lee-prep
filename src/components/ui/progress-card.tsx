// components/ui/progress-card.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  title: string;
  description: string;
  value: number;
}

export function ProgressCard({ title, description, value }: ProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={value} className="h-2" />
        <p className="mt-2 text-sm text-muted-foreground">
          {value}% complete
        </p>
      </CardContent>
    </Card>
  );
}