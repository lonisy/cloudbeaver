/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { Bootstrap, injectable } from '@cloudbeaver/core-di';
import { CommonDialogService, DialogueStateResult } from '@cloudbeaver/core-dialogs';
import { ServerConfigResource, SessionExpireService, SessionResource } from '@cloudbeaver/core-root';
import { getCookies } from '@cloudbeaver/core-utils';

import { SessionExpireWarningDialog } from '../SessionExpireWarningDialog/SessionExpireWarningDialog';

const SESSION_COOKIE_NAME = 'cb-session';
const WARN_IN = 5 * 1000 * 60;
const POLL_INTERVAL = 1 * 1000 * 60;

@injectable()
export class SessionExpireWarningDialogService extends Bootstrap {
  private dialogInternalPromise: Promise<DialogueStateResult | null> | null;

  constructor(
    private commonDialogService: CommonDialogService,
    private sessionExpireService: SessionExpireService,
    private serverConfigResource: ServerConfigResource,
    private sessionResource: SessionResource,
  ) {
    super();
    this.dialogInternalPromise = null;
  }

  register(): void {
    this.sessionExpireService.onSessionExpire.addHandler(this.close.bind(this));
  }

  load(): void {
    this.startSessionPolling();
  }

  private startSessionPolling() {
    const poll = () => {
      const cookies = getCookies();
      const sessionDuration = this.serverConfigResource.data?.sessionExpireTime;
      const sessionExpiredTime = cookies[SESSION_COOKIE_NAME];

      if (!sessionExpiredTime) {
        this.sessionExpireService.handleSessionExpired();
        return;
      }

      if (this.sessionExpireService.sessionExpired || !sessionDuration || sessionDuration < WARN_IN) {
        this.close();
        return;
      }

      if (!this.dialogInternalPromise) {
        const remainingTime = new Date(sessionExpiredTime).getTime() - Date.now();
        if (remainingTime < WARN_IN) {
          this.open();
        }
      }
    };

    setInterval(poll, POLL_INTERVAL);
  }

  private async open(): Promise<void> {
    if (!this.dialogInternalPromise) {
      this.dialogInternalPromise = this.commonDialogService.open(SessionExpireWarningDialog, null);
      await this.dialogInternalPromise;
      this.dialogInternalPromise = null;

      const cookies = getCookies();

      if (!this.sessionExpireService.sessionExpired) {
        if (cookies[SESSION_COOKIE_NAME]) {
          await this.sessionResource.refreshSilent();
        } else {
          this.sessionExpireService.handleSessionExpired();
        }
      }
    }
  }

  private close(): void {
    if (this.dialogInternalPromise) {
      this.commonDialogService.rejectDialog(this.dialogInternalPromise);
      this.dialogInternalPromise = null;
    }
  }
}
