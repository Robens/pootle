#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (C) Pootle contributors.
#
# This file is a part of the Pootle project. It is distributed under the GPL3
# or later license. See the LICENSE file for a copy of the license and the
# AUTHORS file for copyright and authorship information.

import json
import logging
import os

# This must be run before importing Django.
os.environ['DJANGO_SETTINGS_MODULE'] = 'pootle.settings'

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError

from virtualfolder.models import VirtualFolder


class Command(BaseCommand):
    help = "Add virtual folders from file."

    def handle(self, *args, **options):
        """Add virtual folders from file."""

        if not args:
            raise CommandError("You forgot to provide the mandatory filename.")

        try:
            inputfile = open(args[0], "r")
            vfolders = json.load(inputfile)
            inputfile.close()
        except IOError as e:
            raise CommandError(e)
        except ValueError as e:
            raise CommandError("Please check if the JSON file is malformed. "
                               "Original error:\n%s" %e)

        logging.info("Importing virtual folders...")

        added_count = 0
        updated_count = 0
        errored_count = 0

        for vfolder_item in vfolders:
            vfolder_item['name'] = vfolder_item['name'].lower()

            # Put all the files for each virtual folder as a list and save it
            # as its filter rules.
            try:
                vfolder_item['filter_rules'] = ','.join(vfolder_item['filters']['files'])
            except KeyError:
                vfolder_item['filter_rules'] = ''

            if 'filters' in vfolder_item:
                del vfolder_item['filters']

            # Now create or update the virtual folder.
            try:
                # Retrieve the virtual folder if it exists.
                vfolder = VirtualFolder.objects.get(
                    name=vfolder_item['name'],
                    location=vfolder_item['location'],
                )
            except VirtualFolder.DoesNotExist:
                # If the virtual folder doesn't exist yet then create it.
                try:
                    vfolder = VirtualFolder(**vfolder_item)
                    vfolder.save()
                except ValidationError as e:
                    errored_count += 1
                    logging.error(e.message)
                else:
                    logging.info("Added new virtual folder %s", vfolder.name)
                    added_count += 1
            else:
                # Update the already existing virtual folder.
                changed = False

                if vfolder.filter_rules != vfolder_item['filter_rules']:
                    vfolder.filter_rules = vfolder_item['filter_rules']
                    changed = True
                    logging.debug("Filter rules for virtual folder '%s' will "
                                  "be changed.", vfolder.name)

                if ('priority' in vfolder_item and
                    vfolder.priority != vfolder_item['priority']):

                    vfolder.priority = vfolder_item['priority']
                    changed = True
                    logging.debug("Priority for virtual folder '%s' will be "
                                  "changed to %f.", vfolder.name,
                                  vfolder.priority)

                if ('is_browsable' in vfolder_item and
                    vfolder.is_browsable != vfolder_item['is_browsable']):

                    vfolder.is_browsable = vfolder_item['is_browsable']
                    changed = True
                    logging.debug("is_browsable status for virtual folder "
                                  "'%s' will be changed.", vfolder.name)

                if ('description' in vfolder_item and
                    vfolder.description.raw != vfolder_item['description']):

                    vfolder.description = vfolder_item['description']
                    changed = True
                    logging.debug("Description for virtual folder '%s' will "
                                  "be changed.", vfolder.name)

                if changed:
                    try:
                        vfolder.save()
                    except ValidationError as e:
                        errored_count += 1
                        logging.error(e.message)
                    else:
                        logging.info("Updated virtual folder %s", vfolder.name)
                        updated_count += 1

        logging.info("\nErrored: %d\nAdded: %d\nUpdated: %d\nUnchanged: %d",
                     errored_count, added_count, updated_count,
                     len(vfolders)-errored_count-added_count-updated_count)
