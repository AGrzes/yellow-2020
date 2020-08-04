import { DataAccess } from '@agrzes/yellow-2020-common-data';
import { ModelAccess, ModelDescriptor } from '@agrzes/yellow-2020-common-metadata';
import { Module } from 'vuex';
export default function metadataState<R>(access: DataAccess<ModelDescriptor, string, string, any>): Module<ModelAccess, R>;
