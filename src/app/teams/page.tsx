'use client';

import { useEffect, useState } from 'react';

const TeamsPage = () => {
  const [teams, setTeams] = useState<Array<{ id: number; name: string; members: Array<{ id: number; name: string; role: string; status: string; discord?: string; avatar?: string }> }>>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const response = await fetch('/api/teams');
      const data = await response.json();
      setTeams(data);
    };

    fetchTeams();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {teams.map((team: { id: number; name: string; members: Array<{ id: number; name: string; role: string; status: string; discord?: string; avatar?: string }> }) => (
        <div key={team.id} className="bg-white/5 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{team.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members
              .filter((member: { status: string }) => member.status !== 'inactive')
              .map((member: { id: number; name: string; role: string; discord?: string; avatar?: string }) => (
                <div key={member.id} className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-400">{member.role}</p>
                  {member.discord && (
                    <a
                      href={`https://discord.com/users/${member.discord}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Discord Profili
                    </a>
                  )}
                  {member.discord && member.avatar && (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${member.discord}/${member.avatar}.png`}
                      alt={`${member.name}'s avatar`}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamsPage; 