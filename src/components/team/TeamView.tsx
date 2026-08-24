import React from 'react';
import { Mail, Users } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export const TeamView: React.FC = () => {
  const { user } = useAuth();
  const { team, tasks, projects } = useProject();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Team Members</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Collaborate, check active presence, and view member project workloads.
          </p>
        </div>
      </div>

      {/* Team Cards Grid */}
      {team.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto mt-6">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No Team Members Found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-2">
            Team members will appear here as users join your workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((member) => {
            const isCurrentUser = user?.id === member.id;
            const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
            const completedTasks = memberTasks.filter((t) => t.status === 'completed').length;
            const activeTasks = memberTasks.length - completedTasks;
            const memberProjects = projects.filter((p) => p.members.includes(member.id));

            return (
              <div
                key={member.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  isCurrentUser
                    ? 'border-indigo-300 ring-2 ring-indigo-500/10 shadow-xs'
                    : 'border-gray-200 shadow-xs hover:shadow-md'
                }`}
              >
                <div>
                  {/* Profile Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={member.name}
                        avatarUrl={member.avatar}
                        size="md"
                        status={member.status || 'online'}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-gray-900">{member.name}</h3>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-800 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{member.role}</div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${
                        member.status === 'online'
                          ? 'bg-emerald-100 text-emerald-800'
                          : member.status === 'busy'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {member.status || 'online'}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 px-2.5 py-1.5 bg-gray-50 rounded-xl">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  {/* Workload Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center p-3 bg-gray-50/60 rounded-xl mb-4 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Active</span>
                      <div className="font-bold text-gray-800 mt-0.5">{activeTasks}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Done</span>
                      <div className="font-bold text-emerald-600 mt-0.5">{completedTasks}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Projects</span>
                      <div className="font-bold text-indigo-600 mt-0.5">{memberProjects.length}</div>
                    </div>
                  </div>

                  {/* Projects Pills */}
                  {memberProjects.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Active In
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {memberProjects.slice(0, 3).map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 rounded-md truncate max-w-[140px]"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
