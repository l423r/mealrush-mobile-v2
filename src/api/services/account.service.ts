import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type { AccountResponse, DeleteAccountRequest } from '../../types/api.types';

export const accountService = {
  getAccountInfo: () =>
    apiClient.get<AccountResponse>(ApiRoutes.Account.Base),

  deleteAccount: (request: DeleteAccountRequest) =>
    apiClient.delete(ApiRoutes.Account.Base, { data: request }),
};
