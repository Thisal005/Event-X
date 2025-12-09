package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.model.Account;
import com.oop.EventTicketingSystem.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/create")
    public Account createAccount(@RequestParam int type, @RequestParam String name) throws IOException {
        // Create a new account with the specified type and name
        return accountService.createAccount(type, name);
    }


    @GetMapping("/load")
    public boolean loadAccount(@RequestParam String id, @RequestParam String type) {
        // Determine the filename based on the account type
        String filename = type.equals("customer") ? "Customers.json" : "Vendors.json";

        // Load the account from the specified file
        return accountService.loadAccount(id, filename);
    }
}