package com.oop.EventTicketingSystem.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.oop.EventTicketingSystem.model.Account;
import org.springframework.stereotype.Service;

import java.io.*;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class AccountService {
    private static int vendorID = 100250;
    private static int customerID = 200250;

    public Account createAccount(int input, String name) throws IOException {
        Random random = new Random();
        int randomNumber = random.nextInt(100) + 1;
        Account account;

        if (input == 1) {
            customerID += randomNumber;
            account = new Account(customerID, name);
            saveAccount(account, "Customers.json");
            LoggerService.log("Created Customer Account: " + "ID :- " + customerID  +  " "+ account);
        } else if (input == 2) {
            vendorID += randomNumber;
            account = new Account(vendorID, name);
            saveAccount(account, "Vendors.json");
            LoggerService.log("Created Vendor Account: " + "ID :- "+ vendorID + " " + account);
        } else {
            throw new IllegalArgumentException("Invalid Input!");
        }

        return account;
    }

    public boolean loadAccount(String searchID, String filename) {
        File file = new File("data", filename);
        try (Reader reader = new FileReader(file)) {
            Gson gson = new Gson();
            Type accountListType = new TypeToken<List<Account>>(){}.getType();
            List<Account> accounts = gson.fromJson(reader, accountListType);

            for (Account account : accounts) {
                if (String.valueOf(account.getId()).equals(searchID)) {
                    return true;
                }
            }
            return false;

        } catch (IOException e) {
            LoggerService.log("Error searching account: " + searchID + " in " + filename);
            return false;
        }
    }

    private void saveAccount(Account account, String filename) throws IOException {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        List<Account> accounts = new ArrayList<>();

        File file = new File("data", filename);

        if (file.exists() && file.length() > 0) {
            try (Reader reader = new FileReader(file)) {
                Type accountListType = new TypeToken<List<Account>>(){}.getType();
                accounts = gson.fromJson(reader, accountListType);
            } catch (IOException e) {
                LoggerService.log("Error reading existing accounts: " + e.getMessage());
            }
        }

        accounts.add(account);

        try (Writer writer = new FileWriter(file)) {
            gson.toJson(accounts, writer);
        }
    }
}