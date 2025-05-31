'use client'
import { useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Filter,
  Search,
  ChevronRight,
  BarChart3,
  Clock,
  Star,
  BookText,
  Mic,
  Play,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Course = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const courses = [
    {
      id: 1,
      title: "English for Beginners",
      level: "Beginner",
      lessons: 24,
      duration: "12 hours",
      progress: 45,
      image: "beginner.jpg",
    },
    {
      id: 2,
      title: "Business English Mastery",
      level: "Intermediate",
      lessons: 18,
      duration: "10 hours",
      progress: 30,
      image: "business.jpg",
    },
    {
      id: 3,
      title: "Academic English",
      level: "Advanced",
      lessons: 20,
      duration: "15 hours",
      progress: 0,
      image: "academic.jpg",
    },
    {
      id: 4,
      title: "Travel English",
      level: "Intermediate",
      lessons: 12,
      duration: "6 hours",
      progress: 75,
      image: "travel.jpg",
    },
    {
      id: 5,
      title: "Job Interview Preparation",
      level: "Intermediate",
      lessons: 10,
      duration: "8 hours",
      progress: 20,
      image: "interview.jpg",
    },
    {
      id: 6,
      title: "Everyday Conversations",
      level: "Beginner",
      lessons: 15,
      duration: "7 hours",
      progress: 60,
      image: "everyday.jpg",
    },
  ];

  const pathways = [
    {
      title: "Career Growth",
      description: "English skills for job interviews, workplace communication",
      icon: <GraduationCap className="h-5 w-5" />,
      courses: 4,
      popular: true,
    },
    {
      title: "Academic Success",
      description: "Prepare for exams, presentations, and research papers",
      icon: <BookText className="h-5 w-5" />,
      courses: 3,
      popular: false,
    },
    {
      title: "Travel & Culture",
      description: "Essential phrases and cultural understanding for travelers",
      icon: <Globe className="h-5 w-5" />,
      courses: 5,
      popular: true,
    },
    {
      title: "Daily Communication",
      description: "Everyday conversations and casual English",
      icon: <MessageSquare className="h-5 w-5" />,
      courses: 6,
      popular: false,
    },
  ];

  return (
    <div className="px-25 min-h-screen flex flex-col">
      <main className="flex-1 py-6 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
              <p className="text-muted-foreground mt-1">
                Structured courses to build your English skills from beginner to advanced
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recommended Pathways</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pathways.map((pathway, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-primary/5 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {pathway.icon}
                      </div>
                      {pathway.popular && (
                        <Badge className="bg-primary/10 text-primary">Popular</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="text-lg mb-1">{pathway.title}</CardTitle>
                    <CardDescription className="text-sm mb-3">
                      {pathway.description}
                    </CardDescription>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {pathway.courses} courses
                      </span>
                      <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">
                        Explore
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Courses</h2>
              <TabsList>
                <TabsTrigger value="all">All Levels</TabsTrigger>
                <TabsTrigger value="beginner">Beginner</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                        <Button size="sm" variant="secondary" className="rounded-full w-12 h-12 p-0">
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge
                          variant="outline"
                          className={
                            course.level === "Beginner"
                              ? "border-green-200 text-green-700 bg-green-50"
                              : course.level === "Intermediate"
                              ? "border-amber-200 text-amber-700 bg-amber-50"
                              : "border-blue-200 text-blue-700 bg-blue-50"
                          }
                        >
                          {course.level}
                        </Badge>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm ml-1">4.8</span>
                        </div>
                      </div>
                      <h3 className="font-medium text-lg mb-2">{course.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <BookOpen className="h-4 w-4 mr-1" />
                        <span>{course.lessons} lessons</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                      {course.progress > 0 ? (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-1" />
                          <Button className="w-full mt-3" size="sm">
                            Continue
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full mt-3" size="sm" variant="outline">
                          Start Course
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {["beginner", "intermediate", "advanced"].map((level) => (
              <TabsContent key={level} value={level} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses
                    .filter((course) => course.level.toLowerCase() === level)
                    .map((course) => (
                      <Card
                        key={course.id}
                        className="overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video bg-muted relative">
                          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="rounded-full w-12 h-12 p-0"
                            >
                              <Play className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <Badge
                              variant="outline"
                              className={
                                course.level === "Beginner"
                                  ? "border-green-200 text-green-700 bg-green-50"
                                  : course.level === "Intermediate"
                                  ? "border-amber-200 text-amber-700 bg-amber-50"
                                  : "border-blue-200 text-blue-700 bg-blue-50"
                              }
                            >
                              {course.level}
                            </Badge>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="text-sm ml-1">4.8</span>
                            </div>
                          </div>
                          <h3 className="font-medium text-lg mb-2">{course.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mb-3">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>{course.lessons} lessons</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{course.duration}</span>
                          </div>
                          {course.progress > 0 ? (
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-1" />
                              <Button className="w-full mt-3" size="sm">
                                Continue
                              </Button>
                            </div>
                          ) : (
                            <Button className="w-full mt-3" size="sm" variant="outline">
                              Start Course
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Track Your Learning Journey</h2>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Set goals, track progress, and earn rewards as you improve your English skills
            </p>
            <Button>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Progress Dashboard
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Speak & Earn. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm">
                Help Center
              </Button>
              <Button variant="ghost" size="sm">
                Privacy
              </Button>
              <Button variant="ghost" size="sm">
                Terms
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Missing imports
const MessageSquare = (props:any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const Globe = (props:any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default Course;
