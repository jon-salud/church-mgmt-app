import {
  Users,
  Home,
  UsersRound,
  Calendar,
  Megaphone,
  HeartHandshake,
  DollarSign,
  ShieldCheck,
  History,
  Settings,
  UserRoundCog,
  HeartPulse,
  MonitorCheck,
  Menu,
  FileText,
  LucideProps,
} from 'lucide-react';

export const icons = {
  Home,
  Users,
  UsersRound,
  UserRoundCog,
  Calendar,
  Megaphone,
  HeartHandshake,
  DollarSign,
  ShieldCheck,
  History,
  HeartPulse,
  MonitorCheck,
  Settings,
  Menu,
  FileText,
};

interface IconProps extends LucideProps {
  name: keyof typeof icons;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = icons[name];
  return <LucideIcon {...props} />;
};
