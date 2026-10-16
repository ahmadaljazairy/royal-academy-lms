# Email Module Developer Guide & Recipe

## Part 1: How to Use the Module

Since `EmailModule` is decorated with `@Global()`, you import it once in `AppModule` and inject `EmailQueueService` anywhere in your application without re-importing the module.

### 1. Register in `AppModule`

```typescript
import { Module } from '@nestjs/common';
import { EmailModule } from './common/email/email.module.js';

@Module({
  imports: [
    EmailModule,
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Inject and Use in Feature Services (e.g., `AuthService`)

```typescript
import { Injectable } from '@nestjs/common';
import { EmailQueueService } from '../../../common/email/email-queue.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly emailQueueService: EmailQueueService) {}

  async sendWelcomeNotification(userEmail: string, token: string): Promise<void> {
    // Non-blocking asynchronous dispatch to BullMQ
    await this.emailQueueService.queueVerificationEmail(userEmail, token);
  }
}
```



## Part 2: Recipe — Adding a New Email Type

Follow these 5 steps to add a new transactional email flow (e.g., **"Welcome Email"**).

### Step 1: Add the Job Identifier in `email.constants.ts`

```typescript
export const EMAIL_JOB = {
  SEND_VERIFICATION: 'send-verification',
  SEND_PASSWORD_RESET: 'send-password-reset',
  SEND_WELCOME: 'send-welcome', // <-- 1. Add new job key
} as const;
```

### Step 2: Define the Job Payload Interface in `email.interfaces.ts`

```typescript
export interface SendWelcomeJobPayload {
  readonly to: string;
  readonly displayName: string;
}
```

### Step 3: Create the HTML Generator in `email-template.builder.ts`

```typescript
export class EmailTemplateBuilder {
  // ... existing methods ...

  static buildWelcomeTemplate(
    webAppUrl: string,
    displayName: string,
  ): EmailTemplateOutput {
    return {
      subject: 'Welcome to Royal Academy!',
      html: `        <h1>Welcome, ${displayName}!</h1>        <p>Explore your dashboard: <a href="${webAppUrl}">Get Started</a></p>      `,
    };
  }
}
```

### Step 4: Expose Producer Method in `email-queue.service.ts`

```typescript
import type { SendWelcomeJobPayload } from './email.interfaces.js';

@Injectable()
export class EmailQueueService {
  // ... constructor ...

  async queueWelcomeEmail(to: string, displayName: string): Promise<void> {
    const payload: SendWelcomeJobPayload = { to, displayName };

    await this.emailQueue.add(
      EMAIL_JOB.SEND_WELCOME,
      payload,
      DEFAULT_EMAIL_JOB_OPTIONS,
    );

    this.logger.log(`Enqueued welcome email job for: ${to}`);
  }
}
```

### Step 5: Handle Execution in `email.processor.ts`

```ts
@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  // ... constructor ...

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case EMAIL_JOB.SEND_VERIFICATION:
        await this.handleVerification(job.data as SendVerificationJobPayload);
        break;

      case EMAIL_JOB.SEND_PASSWORD_RESET:
        await this.handlePasswordReset(job.data as SendPasswordResetJobPayload);
        break;

      case EMAIL_JOB.SEND_WELCOME: // <-- 5a. Route job to handler
        await this.handleWelcome(job.data as SendWelcomeJobPayload);
        break;

      default:
        this.logger.warn(`Unrecognized email job type: ${job.name}`);
    }
  }

  // 5b. Add private delivery handler
  private async handleWelcome(data: SendWelcomeJobPayload): Promise<void> {
    const { subject, html } = EmailTemplateBuilder.buildWelcomeTemplate(
      this.webAppUrl,
      data.displayName,
    );

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: data.to,
      subject,
      html,
    });

    this.logger.log(`Welcome email successfully delivered to: ${data.to}`);
  }
}
```
