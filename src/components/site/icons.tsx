import {
  Award,
  BookOpen,
  Briefcase,
  Code2,
  Cpu,
  Database,
  Facebook,
  Github,
  Globe,
  GraduationCap,
  Heart,
  Instagram,
  Layers,
  Lightbulb,
  Linkedin,
  Mail,
  MessageCircle,
  Rocket,
  Sparkles,
  Target,
  Terminal,
  Twitter,
  Users,
  Youtube,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  code: Code2,
  terminal: Terminal,
  cpu: Cpu,
  database: Database,
  layers: Layers,
  rocket: Rocket,
  lightbulb: Lightbulb,
  target: Target,
  award: Award,
  briefcase: Briefcase,
  users: Users,
  heart: Heart,
  zap: Zap,
  globe: Globe,
  book: BookOpen,
  graduation: GraduationCap,
};
export const ICON_NAMES = Object.keys(ICONS);

export function ContentIcon({ name, className }: { name?: string | null; className?: string }) {
  const I = (name && ICONS[name]) || Sparkles;
  return <I className={className} aria-hidden />;
}

const SOCIAL: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  email: Mail,
  whatsapp: MessageCircle,
  website: Globe,
};
export const SOCIAL_PLATFORMS = Object.keys(SOCIAL);

export function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const I = SOCIAL[platform.toLowerCase()] ?? Globe;
  return <I className={className} aria-hidden />;
}

export function socialHref(platform: string, url: string) {
  const p = platform.toLowerCase();
  if (p === "email" && !url.startsWith("mailto:")) return `mailto:${url}`;
  if (p === "whatsapp" && !url.startsWith("http")) return `https://wa.me/${url.replace(/\D/g, "")}`;
  return url;
}
