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

import * as React from 'react';
import Select, { Option } from 'react-select';

interface Props {
  name: string;
  value: string;
  groups: string[];
  onChange: (value: string | undefined) => void;
}

export default function GroupSelect(props: Props) {
  return (
    <Select
      name={props.name}
      options={mapGroups(props.groups)}
      value={props.value}
      onChange={(sel: Option | null) =>
        props.onChange(sel ? (sel.value as string) : undefined)
      }
    />
  );
}

function mapGroups(groups) {
  return groups.map(group => {
    const firstColon = group.indexOf(':');
    if (firstColon === -1) {
      return {
        value: group,
        label: group,
      };
    }

    // if colon-prefixed, assume it's a type of group (e.g., ldap, posix)
    const type = group.substring(0, firstColon);
    const name = group.substring(firstColon + 1);
    return {
      value: group,
      label: `${name} (${type})`,
    };
  });
}
