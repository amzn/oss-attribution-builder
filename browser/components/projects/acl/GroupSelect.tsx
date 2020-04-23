// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
  return groups.map((group) => {
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
