use anchor_lang::prelude::*;

#[account]
pub struct User {
    pub username: String,
    pub authority: Pubkey,
}
