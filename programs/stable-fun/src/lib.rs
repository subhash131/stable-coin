use anchor_lang::prelude::*;
mod chainlink_data_feed;
mod state;
use crate::{chainlink_data_feed::*, state::*};

declare_id!("7GVmoLXf5v1F1E5vcRQLe5vgjVqENTyMsJNZGsnpVZQh");

#[program]
pub mod stable_fun {
    use super::*;
    pub fn test(ctx: Context<Execute>) -> Result<()> {
        execute(ctx)
    }

    pub fn register_user(ctx: Context<RegisterUser>, username: String) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.username = username;
        user.authority = ctx.accounts.authority.key();
        msg!("Registered User: {}!", user.username);
        Ok(())
    }
}


#[derive(Accounts)]
#[instruction(username: String)]
pub struct RegisterUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 40,
        seeds = [username.as_bytes()],
        bump
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}