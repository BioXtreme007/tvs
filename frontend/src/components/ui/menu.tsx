import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isSeparator?: boolean;
  onClick?: () => void;
  badge?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  branch?: string;
}

export interface UserProfileSidebarProps {
  user: UserProfile;
  navItems: NavItem[];
  logoutItem: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  };
  className?: string;
  onClose?: () => void;
}

const sidebarVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 16,
    },
  },
};

export const UserProfileSidebar = React.forwardRef<HTMLDivElement, UserProfileSidebarProps>(
  ({ user, navItems, logoutItem, className, onClose }, ref) => {
    return (
      <motion.aside
        ref={ref}
        className={cn(
          'flex h-auto w-80 max-w-[92vw] flex-col rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-4 text-slate-900 shadow-xl shadow-black/10',
          className
        )}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={sidebarVariants}
        aria-label="User Profile Menu"
      >
        {/* User Info Header with Generic User Icon */}
        <motion.div variants={itemVariants} className="flex items-center space-x-3 p-1">
          <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center text-slate-700 shadow-2xs flex-shrink-0">
            <User className="h-5 w-5 text-slate-700" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px] text-[#0B2545] truncate">{user.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
            </div>
            <span className="text-[11px] text-slate-500 truncate">{user.email}</span>
            {user.role && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded px-1.5 py-0.5 mt-1 self-start">
                {user.role} {user.branch ? `· ${user.branch}` : ''}
              </span>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="my-3 border-t border-slate-200/80" />

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1" role="navigation">
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.isSeparator && <motion.div variants={itemVariants} className="my-2 border-t border-slate-100" />}
              <motion.a
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  if (onClose) onClose();
                }}
                variants={itemVariants}
                className="group flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100/90 hover:text-[#0B2545] cursor-pointer"
              >
                <span className="mr-3 h-4 w-4 text-slate-400 group-hover:text-[#7342E2] transition-colors flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </span>
                <span className="flex-1 text-left leading-snug whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                {item.badge && (
                  <span className="ml-2 mr-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60 flex-shrink-0">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 flex-shrink-0" />
              </motion.a>
            </React.Fragment>
          ))}
        </nav>

        {/* Logout Button */}
        <motion.div variants={itemVariants} className="mt-3 pt-2 border-t border-slate-200/80">
          <button
            onClick={() => {
              logoutItem.onClick();
              if (onClose) onClose();
            }}
            className="group flex w-full items-center rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
          >
            <span className="mr-3 h-4 w-4 text-rose-500 group-hover:text-rose-700 flex items-center justify-center flex-shrink-0">
              {logoutItem.icon}
            </span>
            <span>{logoutItem.label}</span>
          </button>
        </motion.div>
      </motion.aside>
    );
  }
);

UserProfileSidebar.displayName = 'UserProfileSidebar';
