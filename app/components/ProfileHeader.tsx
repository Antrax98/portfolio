import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material';
import type { Profile } from '@/lib/api/schemas';
import { Expandable } from './Expandable';
import { iconFor } from './LinkIcon';
import { Markdown } from './Markdown';

interface Props {
  profile: Profile;
  username: string;
}

export function ProfileHeader({ profile, username }: Props) {
  const name = profile.fullName || username;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar
          src={profile.avatarUrl ?? undefined}
          alt={name}
          sx={{ width: 80, height: 80 }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>

          {profile.headline && (
            <Typography variant="subtitle1" color="text.secondary">
              {profile.headline}
            </Typography>
          )}

          {profile.location && (
            <Typography variant="body2" color="text.secondary">
              {profile.location}
            </Typography>
          )}
        </Box>
      </Stack>

      {profile.bio && (
        <Expandable lines={15}>
          <Markdown>{profile.bio}</Markdown>
        </Expandable>
      )}

      {profile.links.length > 0 && (
        <Stack direction="row" spacing={1}>
          {profile.links.map((link) => {
            const Icon = iconFor(link.kind);
            return (
              <IconButton
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label ?? link.kind}
                size="small"
              >
                <Icon />
              </IconButton>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
