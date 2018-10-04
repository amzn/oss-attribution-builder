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
import { Component } from 'react';
import TextLine from './TextLine';

interface Props {
  highlights: any[];
}

export default class TextAnnotator extends Component<Props, {}> {
  /**
   * From selected annotations (highlights), return a set of lines
   * that should be highlighted. "Unrolls" line ranges.
   */
  getHighlightedLines = () => {
    const { highlights } = this.props;
    const lines = new Set();

    for (const annotation of highlights) {
      const [lower, upper] = annotation.lines;
      for (let i = lower; i < upper; i++) {
        lines.add(i);
      }
    }

    return lines;
  };

  render() {
    const { children } = this.props;

    const highlightedLines = this.getHighlightedLines();

    const mapLines = lines => {
      let firstHighlight = false;

      return lines.map((a, i) => {
        const highlight = highlightedLines.has(i);

        // set the scroll marker for the first highlight
        if (highlight && !firstHighlight) {
          firstHighlight = true;
          return (
            <TextLine key={i} highlight={'line-highlight'} scrollTo={true}>
              {a}
            </TextLine>
          );
        }

        return (
          <TextLine
            key={i}
            highlight={highlight ? 'line-highlight' : undefined}
          >
            {a}
          </TextLine>
        );
      });
    };

    return <pre>{mapLines(children)}</pre>;
  }
}
