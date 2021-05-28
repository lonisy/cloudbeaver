/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import styled, { css, use } from 'reshadow';

import { IconOrImage } from '@cloudbeaver/core-blocks';
import { useTranslate } from '@cloudbeaver/core-localization';
import { EOrder, getNextOrder, IDatabaseDataModel, IDatabaseDataResult, ResultSetConstraintAction } from '@cloudbeaver/plugin-data-viewer';

const styles = css`
  order-button {
    margin-left: 4px;
    display: flex;
    padding: 2px 4px;
    flex-direction: column;
    align-content: center;
    align-items: center;
    min-width: 20px;
    box-sizing: border-box;
    cursor: pointer;
  }
  order-button > IconOrImage {
    width: 12px;
  }
  order-button:hover > IconOrImage {
    width: 13px;
  }
  order-button[|disabled] {
    opacity: 0.7;
    cursor: default;
  }
`;

interface Props {
  model: IDatabaseDataModel<any, IDatabaseDataResult>;
  resultIndex: number;
  columnName: string;
  className?: string;
}

export const OrderButton: React.FC<Props> = observer(function OrderButtton({
  model,
  resultIndex,
  columnName,
  className,
}) {
  const translate = useTranslate();
  const constraints = model.source.getAction(resultIndex, ResultSetConstraintAction);
  const currentOrder = constraints.getOrder(columnName);
  const loading = model.isLoading();

  let icon = 'sort-arrow-unknown';
  if (currentOrder === EOrder.asc) {
    icon = 'sort-arrow-up';
  } else if (currentOrder === EOrder.desc) {
    icon = 'sort-arrow-down';
  }

  const handleSort = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (loading) {
      return;
    }

    const nextOrder = getNextOrder(currentOrder);
    constraints.setOrder(columnName, nextOrder, e.ctrlKey || e.metaKey);
    model.refresh();
  };

  return styled(styles)(
    <order-button
      as='div'
      title={translate('data_grid_table_tooltip_column_header_sort')}
      className={className}
      onClick={handleSort}
      {...use({ disabled: loading })}
    >
      <IconOrImage icon={icon} viewBox='0 0 16 16' />
    </order-button>
  );
});