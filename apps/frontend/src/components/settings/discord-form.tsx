import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { getSubmitErrorMessage, PasswordField, TextField } from '@/components/ui/form-fields';

export interface DiscordFormValues {
	botToken: string;
	applicationId: string;
	publicKey: string;
	mentionRoleIds: string;
	respondToChannelIds: string;
}

export interface DiscordFormProps {
	hasProjectConfig: boolean;
	initialApplicationId: string;
	initialPublicKey: string;
	initialMentionRoleIds: string;
	initialRespondToChannelIds: string;
	onSubmit: (values: DiscordFormValues) => Promise<void>;
	onCancel: () => void;
	isPending: boolean;
}

export function DiscordForm({
	hasProjectConfig,
	initialApplicationId,
	initialPublicKey,
	initialMentionRoleIds,
	initialRespondToChannelIds,
	onSubmit,
	onCancel,
	isPending,
}: DiscordFormProps) {
	const [submitError, setSubmitError] = useState<string>();
	const form = useForm({
		defaultValues: {
			botToken: '',
			applicationId: initialApplicationId,
			publicKey: initialPublicKey,
			mentionRoleIds: initialMentionRoleIds,
			respondToChannelIds: initialRespondToChannelIds,
		},
		onSubmit: async ({ value }) => {
			setSubmitError(undefined);
			try {
				await onSubmit(value);
				form.reset();
			} catch (error) {
				setSubmitError(getSubmitErrorMessage(error, 'Failed to save integration.'));
			}
		},
	});

	const handleCancel = () => {
		setSubmitError(undefined);
		onCancel();
	};

	return (
		<div className='flex flex-col gap-4 p-4 rounded-xl border border-border bg-background'>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
				className='flex flex-col gap-4'
			>
				<span className='text-sm font-medium text-foreground'>Discord</span>

				<div className='grid gap-3'>
					<p className='text-[11px] text-muted-foreground leading-relaxed'>
						<a
							href='https://discord.com/developers/applications'
							target='_blank'
							rel='noopener noreferrer'
							className='inline-flex items-center gap-1 underline hover:text-foreground'
						>
							See how to create a Discord application and bot
							<ExternalLink className='size-3' />
						</a>
						<span>
							{' '}
							Discord interactions are delivered to this nao instance and verified with the application
							public key. People are linked automatically using their Discord account.
						</span>
					</p>
					<PasswordField
						form={form}
						name='botToken'
						label='Bot token'
						placeholder='Enter your Discord bot token'
						required
					/>
					<TextField
						form={form}
						name='applicationId'
						label='Application ID'
						placeholder='Enter your Discord application ID'
						required
					/>
					<TextField
						form={form}
						name='publicKey'
						label='Public key'
						placeholder='Enter your Discord application public key'
						required
					/>
					<TextField
						form={form}
						name='mentionRoleIds'
						label='Trigger role IDs (comma separated)'
						placeholder='123456789012345678, 987654321098765432'
						hint='optional'
					/>
					<TextField
						form={form}
						name='respondToChannelIds'
						label='Respond to channel IDs (comma separated)'
						placeholder='123456789012345678, 987654321098765432'
						hint='optional'
					/>
				</div>

				{submitError && <ErrorMessage message={submitError} />}

				<div className='flex justify-end gap-2 pt-2'>
					<Button variant='ghost' size='sm' type='button' onClick={handleCancel}>
						Cancel
					</Button>
					<form.Subscribe selector={(state) => [state.canSubmit, state.values] as const}>
						{([canSubmit, values]) => (
							<Button
								size='sm'
								type='submit'
								variant='primary-gradient'
								disabled={!canSubmit || !hasRequiredDiscordValues(values) || isPending}
							>
								{hasProjectConfig ? 'Update' : 'Save'}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}

function hasRequiredDiscordValues(values: DiscordFormValues): boolean {
	return Boolean(values.botToken.trim() && values.applicationId.trim() && values.publicKey.trim());
}
