import { Module } from 'vuex';
import { DataAccess } from '@agrzes/yellow-2020-common-data';
import { ModelDescriptor, ModelAccess } from '@agrzes/yellow-2020-common-metadata';
export default function metadataState<R>(access: DataAccess<ModelDescriptor, string, string, any>): Module<ModelAccess, R>;
