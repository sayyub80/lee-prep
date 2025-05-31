// src/components/courses/course-card.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressCard } from "@/components/ui/progress-card";

interface CourseCardProps {
  level: string;
  title: string;
  progress: number;
  lessons: number;
  image: string;
}

export function CourseCard({ level, title, progress, lessons, image }: CourseCardProps) {
  return (
    <Link href={`/courses/${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="relative h-40 overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
            {level}
          </span>
        </div>
        
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="mt-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{lessons} lessons</span>
            <span>{progress}% complete</span>
          </div>
          <ProgressCard value={progress} className="h-2" />
        </CardContent>
      </Card>
    </Link>
  );
}