/*
 * DBeaver - Universal Database Manager
 * Copyright (C) 2010-2023 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.cloudbeaver.model.rm.local;

import org.eclipse.core.runtime.IConfigurationElement;
import org.jkiss.dbeaver.DBException;
import org.jkiss.dbeaver.model.impl.AbstractDescriptor;

public class RMFileOperationHandlerDescriptor extends AbstractDescriptor {
    public static final String EXTENSION_ID = "io.cloudbeaver.rm.file.handler"; //$NON-NLS-1$

    private final String id;
    private final RMFileOperationHandler instance;

    public RMFileOperationHandlerDescriptor(IConfigurationElement config) throws DBException {
        super(config);
        this.id = config.getAttribute("id");
        ObjectType implClass = new ObjectType(config.getAttribute("class"));
        this.instance = implClass.createInstance(RMFileOperationHandler.class);
    }

    public RMFileOperationHandler getInstance() {
        return instance;
    }
}
