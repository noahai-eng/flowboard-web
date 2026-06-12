-- handle_new_user soll nur als Trigger laufen, nicht ueber die REST-RPC-API
-- aufrufbar sein. Trigger-Ausfuehrung braucht kein EXECUTE-Grant.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
