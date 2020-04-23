// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Request, Response } from 'express';

type Handler = (req: Request, res: Response) => Promise<any>;

export function asyncApi(handler: Handler) {
  return (req, res, next) => {
    handler(req, res)
      .then((obj) => {
        if (obj == undefined) {
          res.status(404).send({ error: 'Object not found' });
        } else {
          res.send(obj);
        }
      })
      .catch(next);
  };
}
