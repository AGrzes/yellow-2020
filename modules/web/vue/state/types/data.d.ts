import { Module } from 'vuex';
import { DataAccess } from '@agrzes/yellow-2020-common-data';
export default function dataState<S, R>(access: DataAccess<S, string, string, any>): Module<{
    [key: string]: S;
}, R>;
