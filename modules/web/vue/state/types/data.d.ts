import { DataAccess } from '@agrzes/yellow-2020-common-data';
import { Module } from 'vuex';
export default function dataState<S, R>(access: DataAccess<S, string, string, any>): Module<{
    [key: string]: S;
}, R>;
