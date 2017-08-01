/* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import AuthBase from '../base';

export default class NullAuth implements AuthBase {

  extractRequestUser(request: any): string {
    return request.get('X-REMOTE-USER') || request.get('X-FORWARDED-USER') || process.env.USER || 'unknown';
  }

  async getDisplayName(user: string): Promise<string> {
    return user;
  }

  async getGroups(user: string): Promise<string[]> {
    return [`self:${user}`, 'everyone'];
  }

}
