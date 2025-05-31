'use client'
import { useState } from "react";
import {
  Users,
  MessageSquare,
  Clock,
  Search,
  Filter,
  ThumbsUp,
  User,
  Share2,
  MessageCircle,
  ChevronRight,
  Mic,
  Calendar,
  Globe,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Community = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const discussions = [
    {
      id: 1,
      user: {
        name: "Priya S.",
        avatar: "P",
        role: "Learner",
      },
      title: "Tips for improving pronunciation?",
      content:
        "I've been learning English for 2 years but still struggle with certain sounds. Any advice on how to improve my pronunciation, especially with 'th' sounds?",
      tags: ["pronunciation", "speaking"],
      likes: 24,
      comments: 18,
      time: "2 hours ago",
    },
    {
      id: 2,
      user: {
        name: "Rahul M.",
        avatar: "R",
        role: "Intermediate",
      },
      title: "Business English phrases I've learned",
      content:
        "I wanted to share some useful business English phrases I've picked up in my job interviews. These helped me a lot!",
      tags: ["business", "vocabulary"],
      likes: 42,
      comments: 7,
      time: "5 hours ago",
    },
    {
      id: 3,
      user: {
        name: "Sarah K.",
        avatar: "S",
        role: "Native Speaker",
      },
      title: "Common mistakes Indian English speakers make",
      content:
        "As an English teacher, I've noticed some common patterns among Indian English learners. Here's a friendly guide to avoid these mistakes.",
      tags: ["grammar", "indian-english"],
      likes: 76,
      comments: 31,
      time: "Yesterday",
    },
  ];

  const practiceGroups = [
    {
      id: 1,
      name: "Job Interview Practice",
      members: 28,
      active: 5,
      nextSession: "Today, 7:00 PM",
      level: "Intermediate",
    },
    {
      id: 2,
      name: "Daily Conversation Club",
      members: 45,
      active: 12,
      nextSession: "Tomorrow, 6:30 PM",
      level: "Beginner",
    },
    {
      id: 3,
      name: "Pronunciation Workshop",
      members: 36,
      active: 3,
      nextSession: "Today, 9:00 PM",
      level: "All Levels",
    },
    {
      id: 4,
      name: "Business English Group",
      members: 52,
      active: 8,
      nextSession: "Thursday, 8:00 PM",
      level: "Advanced",
    },
  ];

  const events = [
    {
      id: 1,
      title: "English Movie Discussion",
      date: "Apr 20, 2025",
      time: "6:00 PM IST",
      participants: 18,
      host: "Movie Club",
    },
    {
      id: 2,
      title: "Debate Competition",
      date: "Apr 25, 2025",
      time: "7:30 PM IST",
      participants: 24,
      host: "Speaking Stars",
    },
    {
      id: 3,
      title: "Job Interview Workshop",
      date: "May 2, 2025",
      time: "5:00 PM IST",
      participants: 32,
      host: "Career English",
    },
  ];

  const partners = [
    {
      id: 1,
      name: "Emily T.",
      language: "English (Native)",
      country: "United States",
      interests: ["Movies", "Travel", "Technology"],
      level: "Will help you practice",
      online: true,
    },
    {
      id: 2,
      name: "Amit R.",
      language: "English (Advanced)",
      country: "India",
      interests: ["Books", "Music", "Cooking"],
      level: "Language exchange",
      online: true,
    },
    {
      id: 3,
      name: "David L.",
      language: "English (Native)",
      country: "UK",
      interests: ["Sports", "History", "Politics"],
      level: "Will help you practice",
      online: false,
    },
    {
      id: 4,
      name: "Leela P.",
      language: "English (Intermediate)",
      country: "India",
      interests: ["Art", "Science", "Photography"],
      level: "Practice partners",
      online: true,
    },
  ];

  return (
    <div className="min-h-screen flex px-25 bg-gray-100 flex-col">

      <main className="flex-1 py-6 bg-secondary/30">
        <div className="container px-4 md:px-">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Community</h1>
              <p className="text-muted-foreground mt-1">
                Connect with other learners and practice your English skills together
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search community..."
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

          <Tabs defaultValue="discussions">
            <TabsList className="mb-6 w-full md:w-auto grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="practice">Practice Groups</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="partners">Find Partners</TabsTrigger>
            </TabsList>

            <TabsContent value="discussions" className="mt-0">
              <div className="flex justify-end mb-4">
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Discussion
                </Button>
              </div>
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <Card key={discussion.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="avatar-ring">
                            <AvatarFallback>{discussion.user.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{discussion.user.name}</div>
                            <div className="text-xs text-muted-foreground">{discussion.user.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {discussion.time}
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{discussion.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">{discussion.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {discussion.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <div className="flex space-x-4">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{discussion.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>{discussion.comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8">
                        View Discussion
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="practice" className="mt-0">
              <div className="flex justify-end mb-4">
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {practiceGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <CardDescription>
                            {group.members} members • {group.active} active now
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            group.level === "Beginner"
                              ? "border-green-200 text-green-700 bg-green-50"
                              : group.level === "Intermediate"
                              ? "border-amber-200 text-amber-700 bg-amber-50"
                              : group.level === "Advanced"
                              ? "border-blue-200 text-blue-700 bg-blue-50"
                              : "border-gray-200"
                          }
                        >
                          {group.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-0">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Next session: {group.nextSession}</span>
                      </div>
                      
                      <div className="flex -space-x-2 overflow-hidden mt-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-medium"
                          >
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                        {group.members > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium">
                            +{group.members - 4}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4">
                      <Button variant="outline" className="w-full">
                        <Mic className="mr-2 h-4 w-4" />
                        Join Practice Group
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <div className="flex justify-end mb-4">
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
              </div>
              {events.map((event) => (
                <Card key={event.id} className="mb-4 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-md bg-primary/10 flex flex-col items-center justify-center">
                          <span className="text-xs text-primary font-medium">
                            {event.date.split(",")[0]}
                          </span>
                          <span className="text-lg font-semibold">
                            {event.date.split(" ")[1].replace(",", "")}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.time}
                            <span className="mx-2">•</span>
                            <Users className="h-3 w-3 mr-1" />
                            {event.participants} participants
                          </div>
                          <div className="text-xs mt-1">Hosted by: {event.host}</div>
                        </div>
                      </div>
                      <Button size="sm">Join</Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="partners" className="mt-0">
              <div className="flex justify-end mb-4">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Find More Partners
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partners.map((partner) => (
                  <Card key={partner.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar className={partner.online ? "avatar-ring" : ""}>
                            <AvatarFallback>
                              {partner.name.split(" ")[0][0]}
                              {partner.name.split(" ")[1][0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">
                              {partner.name}
                              {partner.online && (
                                <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                              )}
                            </CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                              <Globe className="h-3 w-3 mr-1" />
                              {partner.country}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {partner.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Speaks</p>
                          <p className="text-sm text-muted-foreground">{partner.language}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Interests</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {partner.interests.map((interest) => (
                              <Badge key={interest} variant="secondary" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Start Conversation
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

    </div>
  );
};

export default Community;
